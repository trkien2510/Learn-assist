from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from core.config import settings
from models.otp_model import OTPPurpose


conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.PROJECT_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fm = FastMail(conf)


def get_otp_email_subject(purpose: OTPPurpose) -> str:
    subjects = {
        OTPPurpose.REGISTRATION: "Xác thực email đăng ký tài khoản",
        OTPPurpose.FORGOT_PASSWORD: "Đặt lại mật khẩu",
        OTPPurpose.REACTIVATE_ACCOUNT: "Kích hoạt lại tài khoản"
    }
    return subjects.get(purpose, "Mã xác thực OTP")


def get_otp_email_template(otp_code: str, purpose: OTPPurpose, full_name: str = None) -> str:
    purpose_messages = {
        OTPPurpose.REGISTRATION: {
            "title": "Xác thực đăng ký tài khoản",
            "message": "Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã OTP bên dưới để hoàn tất việc đăng ký."
        },
        OTPPurpose.FORGOT_PASSWORD: {
            "title": "Đặt lại mật khẩu",
            "message": "Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP bên dưới để tiếp tục."
        },
        OTPPurpose.REACTIVATE_ACCOUNT: {
            "title": "Kích hoạt lại tài khoản",
            "message": "Bạn đã yêu cầu kích hoạt lại tài khoản. Vui lòng sử dụng mã OTP bên dưới để tiếp tục."
        }
    }

    content = purpose_messages.get(purpose, {
        "title": "Mã xác thực OTP",
        "message": "Vui lòng sử dụng mã OTP bên dưới."
    })

    greeting = f"Xin chào {full_name}," if full_name else "Xin chào,"

    html = f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{content['title']}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                    {settings.PROJECT_NAME}
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 20px; font-weight: 600;">
                                    {content['title']}
                                </h2>
                                <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    {greeting}
                                </p>
                                <p style="margin: 0 0 32px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    {content['message']}
                                </p>
                                
                                <!-- OTP Code Box -->
                                <div style="background: linear-gradient(135deg, #f6f8fc 0%, #eef2f7 100%); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
                                    <p style="margin: 0 0 12px; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                                        Mã xác thực của bạn
                                    </p>
                                    <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">
                                        {otp_code}
                                    </div>
                                </div>
                                
                                <p style="margin: 0 0 16px; color: #718096; font-size: 14px; line-height: 1.6;">
                                    ⏱️ Mã OTP có hiệu lực trong <strong>5 phút</strong>.
                                </p>
                                <p style="margin: 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                    ⚠️ Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                    © 2024 {settings.PROJECT_NAME}. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html


async def send_otp_email(email: str, otp_code: str, purpose: OTPPurpose, full_name: str = None):
    subject = get_otp_email_subject(purpose)
    html_content = get_otp_email_template(otp_code, purpose, full_name)

    message = MessageSchema(
        subject=subject,
        recipients=[email],
        body=html_content,
        subtype=MessageType.html
    )

    await fm.send_message(message)


async def send_account_notification_email(email: str, full_name: str, notification_type: str, reason: str = None):
    templates = {
        "self_deleted": {
            "subject": "Tài khoản của bạn đã được xóa",
            "title": "Xác nhận xóa tài khoản",
            "message": "Tài khoản của bạn trên hệ thống Learn Assist đã được xóa thành công theo yêu cầu của bạn. Tất cả dữ liệu liên quan đã được xóa vĩnh viễn.",
            "color": "#667eea"
        },
        "account_deleted": {
            "subject": "Tài khoản của bạn đã bị xóa bởi quản trị viên",
            "title": "Thông báo xóa tài khoản",
            "message": "Tài khoản của bạn trên hệ thống Learn Assist đã bị xóa bởi quản trị viên. Tất cả dữ liệu liên quan đã được xóa vĩnh viễn.",
            "color": "#e53e3e"
        },
        "account_deactivated": {
            "subject": "Tài khoản của bạn đã bị vô hiệu hóa bởi quản trị viên",
            "title": "Thông báo vô hiệu hóa tài khoản",
            "message": "Tài khoản của bạn trên hệ thống Learn Assist đã bị vô hiệu hóa bởi quản trị viên. Bạn sẽ không thể đăng nhập cho đến khi tài khoản được kích hoạt lại. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên tại trkien2503@gmail.com để được hỗ trợ.",
            "color": "#dd6b20"
        },
        "account_activated": {
            "subject": "Tài khoản của bạn đã được kích hoạt lại",
            "title": "Thông báo kích hoạt tài khoản",
            "message": "Tài khoản của bạn trên hệ thống Learn Assist đã được kích hoạt lại bởi quản trị viên. Bạn có thể đăng nhập và sử dụng hệ thống bình thường.",
            "color": "#38a169"
        }
    }
    
    template = templates.get(notification_type, {
        "subject": "Thông báo từ Learn Assist",
        "title": "Thông báo",
        "message": "Có thay đổi liên quan đến tài khoản của bạn.",
        "color": "#667eea"
    })
    
    greeting = f"Xin chào {full_name}," if full_name else "Xin chào,"
    reason_text = f"<p style='margin: 16px 0; color: #4a5568; font-size: 14px;'><strong>Lý do:</strong> {reason}</p>" if reason else ""
    
    html = f"""
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{template['title']}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, {template['color']} 0%, #764ba2 100%); border-radius: 16px 16px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                                    {settings.PROJECT_NAME}
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 16px; color: #1a1a2e; font-size: 20px; font-weight: 600;">
                                    {template['title']}
                                </h2>
                                <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    {greeting}
                                </p>
                                <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                    {template['message']}
                                </p>
                                {reason_text}
                                <p style="margin: 24px 0 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                    Nếu bạn có thắc mắc, vui lòng liên hệ với quản trị viên hệ thống.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; text-align: center;">
                                <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                    © 2024 {settings.PROJECT_NAME}. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    message = MessageSchema(
        subject=template['subject'],
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    await fm.send_message(message)
