package com.aitarotreader.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@aitarotreader.com}")
    private String mailFrom;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    public void sendVerificationEmail(String toEmail, String displayName, String rawToken, String locale, String platform) {
        boolean isVi = locale == null || !"en".equalsIgnoreCase(locale);
        String routePrefix = "app".equalsIgnoreCase(platform) ? "/app/auth" : "/auth";
        String encodedToken = URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        String actionUrl = stripTrailingSlash(frontendBaseUrl) + routePrefix + "/verify-email?token=" + encodedToken;

        String subject = isVi
                ? "AI Tarot Reader — Xác thực địa chỉ email của bạn"
                : "AI Tarot Reader — Verify your email address";

        String safeName = HtmlUtils.htmlEscape(displayName != null && !displayName.isBlank() ? displayName : (isVi ? "Bạn" : "Seeker"));
        String title = isVi ? "Xác Thực Địa Chỉ Email" : "Verify Your Email Address";
        String greeting = isVi ? "Xin chào " + safeName + "," : "Hello " + safeName + ",";
        String bodyText = isVi
                ? "Cảm ơn bạn đã đăng ký tài khoản tại AI Tarot Reader. Vui lòng nhấn nút bên dưới để xác thực email và kích hoạt sổ tay trải bài cá nhân của bạn."
                : "Thank you for creating an AI Tarot Reader account. Please click the button below to verify your email address and activate your personal sanctuary.";
        String ctaLabel = isVi ? "Xác Thực Email" : "Verify Email Address";
        String expiryNote = isVi
                ? "Liên kết này có hiệu lực trong vòng 24 giờ và chỉ sử dụng một lần."
                : "This verification link expires in 24 hours and can only be used once.";
        String ignoreNote = isVi
                ? "Nếu bạn không thực hiện đăng ký này, bạn có thể bỏ qua email một cách an toàn."
                : "If you did not create this account, you may safely ignore this email.";

        String html = buildEditorialTemplate(title, greeting, bodyText, ctaLabel, actionUrl, expiryNote, ignoreNote, isVi);
        sendHtmlEmail(toEmail, subject, html);
    }

    public void sendPasswordResetEmail(String toEmail, String displayName, String rawToken, String locale, String platform) {
        boolean isVi = locale == null || !"en".equalsIgnoreCase(locale);
        String routePrefix = "app".equalsIgnoreCase(platform) ? "/app/auth" : "/auth";
        String encodedToken = URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        String actionUrl = stripTrailingSlash(frontendBaseUrl) + routePrefix + "/reset-password?token=" + encodedToken;

        String subject = isVi
                ? "AI Tarot Reader — Đặt lại mật khẩu tài khoản"
                : "AI Tarot Reader — Reset your password";

        String safeName = HtmlUtils.htmlEscape(displayName != null && !displayName.isBlank() ? displayName : (isVi ? "Bạn" : "Seeker"));
        String title = isVi ? "Đặt Lại Mật Khẩu" : "Reset Your Password";
        String greeting = isVi ? "Xin chào " + safeName + "," : "Hello " + safeName + ",";
        String bodyText = isVi
                ? "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản AI Tarot Reader của bạn. Nhấn nút bên dưới để thiết lập mật khẩu mới."
                : "We received a request to reset the password for your AI Tarot Reader account. Click the button below to choose a new password.";
        String ctaLabel = isVi ? "Đặt Lại Mật Khẩu" : "Reset Password";
        String expiryNote = isVi
                ? "Liên kết này có hiệu lực trong vòng 30 phút và chỉ sử dụng một lần. Sau khi đổi mật khẩu, mọi phiên đăng nhập cũ sẽ được thu hồi."
                : "This reset link expires in 30 minutes and can only be used once. All existing sessions will be signed out after reset.";
        String ignoreNote = isVi
                ? "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn."
                : "If you did not request a password reset, please ignore this email. Your account remains secure.";

        String html = buildEditorialTemplate(title, greeting, bodyText, ctaLabel, actionUrl, expiryNote, ignoreNote, isVi);
        sendHtmlEmail(toEmail, subject, html);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Sent auth email '{}' to {}", subject, toEmail);
        } catch (MessagingException | MailException ex) {
            log.error("Failed to send email '{}' to {}: {}", subject, toEmail, ex.getMessage());
            throw new IllegalStateException("Unable to send email at this time", ex);
        }
    }

    private String stripTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:3000";
        }
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }

    private String buildEditorialTemplate(
            String title,
            String greeting,
            String bodyText,
            String ctaLabel,
            String actionUrl,
            String expiryNote,
            String ignoreNote,
            boolean isVi
    ) {
        String safeUrl = HtmlUtils.htmlEscape(actionUrl);
        String fallbackLabel = isVi
                ? "Nếu nút không hoạt động, sao chép liên kết sau vào trình duyệt:"
                : "If the button does not work, copy and paste this link into your browser:";
        String footerTag = isVi
                ? "AI TAROT READER · SUNLIT BOTANICAL ARCHIVE"
                : "AI TAROT READER · SUNLIT BOTANICAL ARCHIVE";

        return """
                <!DOCTYPE html>
                <html lang="%s">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background-color:#FAF9F6;color:#0F172A;font-family:'Helvetica Neue',Arial,sans-serif;">
                  <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background-color:#FAF9F6;padding:32px 16px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;">
                          <tr>
                            <td style="padding:24px 32px;border-bottom:1px solid #E2E8F0;background-color:#FAF9F6;">
                              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#059669;font-weight:700;">
                                %s
                              </div>
                              <h1 style="margin:8px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:#0F172A;font-weight:700;">
                                %s
                              </h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px 32px;font-size:15px;line-height:1.65;color:#1E293B;">
                              <p style="margin:0 0 14px 0;font-weight:600;color:#0F172A;">%s</p>
                              <p style="margin:0 0 24px 0;color:#475569;">%s</p>
                              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px 0;">
                                <tr>
                                  <td style="border-radius:8px;background-color:#059669;">
                                    <a href="%s" target="_blank" rel="noopener noreferrer"
                                       style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:0.03em;">
                                      %s
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:0 0 12px 0;font-size:13px;color:#475569;background-color:#FAF9F6;border:1px solid #E2E8F0;border-radius:8px;padding:12px 14px;">
                                %s
                              </p>
                              <p style="margin:16px 0 6px 0;font-size:12px;color:#64748B;">%s</p>
                              <p style="margin:0 0 16px 0;font-size:12px;word-break:break-all;color:#059669;">
                                <a href="%s" style="color:#059669;text-decoration:underline;">%s</a>
                              </p>
                              <p style="margin:0;font-size:12px;color:#64748B;border-top:1px solid #E2E8F0;padding-top:16px;">
                                %s
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                isVi ? "vi" : "en",
                HtmlUtils.htmlEscape(title),
                footerTag,
                HtmlUtils.htmlEscape(title),
                greeting,
                HtmlUtils.htmlEscape(bodyText),
                safeUrl,
                HtmlUtils.htmlEscape(ctaLabel),
                HtmlUtils.htmlEscape(expiryNote),
                HtmlUtils.htmlEscape(fallbackLabel),
                safeUrl,
                safeUrl,
                HtmlUtils.htmlEscape(ignoreNote)
        );
    }
}
