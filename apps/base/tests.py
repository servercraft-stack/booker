from django.core import mail
from django.test import TestCase, Client, override_settings
from django.urls import reverse

from apps.base.account_utils import send_otp_email
from apps.user.models import User

ANYMAIL_TEST_BACKEND = "anymail.backends.test.EmailBackend"


class HealthCheckTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_health_check_endpoint(self):
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "ok")
        self.assertEqual(data.get("database"), "connected")


class SendOTPEmailTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="otp-tester@example.com",
            password="STrongPass##123",
            first_name="OTP",
            last_name="Tester",
        )

    def _otp_emails(self):
        # The post_save welcome signal also queues an email, so filter by subject.
        return [m for m in mail.outbox if m.subject.startswith("Your OTP for")]

    @override_settings(
        EMAIL_BACKEND=ANYMAIL_TEST_BACKEND,
        DEFAULT_FROM_EMAIL="verified-sender@example.com",
    )
    def test_otp_email_uses_default_from_email(self):
        send_otp_email(self.user.id, "123456", "account verification")

        otp_emails = self._otp_emails()
        self.assertEqual(len(otp_emails), 1)
        otp_email = otp_emails[0]
        self.assertEqual(otp_email.from_email, "verified-sender@example.com")
        self.assertEqual(otp_email.to, [self.user.email])
        self.assertEqual(otp_email.content_subtype, "html")
        self.assertIn("123456", otp_email.body)

    @override_settings(EMAIL_BACKEND=ANYMAIL_TEST_BACKEND)
    def test_otp_email_logs_anymail_message_id(self):
        with self.assertLogs("apps.base.account_utils", level="INFO") as logs:
            send_otp_email(self.user.id, "654321", "password reset")

        queued_logs = [output for output in logs.output if "message_id=" in output]
        self.assertTrue(queued_logs, "expected a log line containing the message id")
        self.assertIn(self.user.email, queued_logs[0])
        self.assertIn("status=sent", queued_logs[0])

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    def test_otp_email_falls_back_when_anymail_status_is_absent(self):
        with self.assertLogs("apps.base.account_utils", level="INFO") as logs:
            send_otp_email(self.user.id, "111222", "account verification")

        fallback_logs = [output for output in logs.output if "OTP email sent to" in output]
        self.assertTrue(fallback_logs)
        self.assertIn(self.user.email, fallback_logs[0])
