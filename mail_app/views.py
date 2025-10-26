from django.shortcuts import render

# Create your views here.
import requests
from django.contrib import messages

def send_email_view(request):
    if request.method == "POST":
        receiver_email = request.POST.get('receiver_email')
        subject = request.POST.get('subject')
        body_text = request.POST.get('body_text')

        api_url = "http://localhost:3000/dev/send-email"

        try:
            response = requests.post(api_url, json={
                "receiver_email": receiver_email,
                "subject": subject,
                "body_text": body_text
            })

            if response.status_code == 200 and response.json().get('success'):
                messages.success(request, "✅ Email sent successfully!")
            else:
                error_detail = response.json().get('error', 'Unknown error')
                messages.error(request, f"❌ Failed to send email: {error_detail}")

        except requests.exceptions.ConnectionError:
            messages.error(request, "⚠️ Serverless API not running. Please start it using 'serverless offline'.")
        except Exception as e:
            messages.error(request, f"Unexpected error: {str(e)}")

    return render(request, 'mailer/send_email.html')
