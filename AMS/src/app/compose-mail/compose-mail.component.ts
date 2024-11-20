import { Component, OnInit, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Input } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { AuthService } from '../services/auth.services';
@Component({
  selector: 'app-compose-mail',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './compose-mail.component.html',
  styleUrl: './compose-mail.component.css',
})
export class ComposeMailComponent implements OnInit {
  subject: string = 'GC-CCS Alumni Tracer Study';
  email: string[] = [];
  message: string = `Greetings esteemed Gordon College – College of Computer Studies alumnus! Your alma mater cordially invites you to partake in a significant endeavor that will greatly contribute to the enhancement of our educational institution. As a valued member of our alumni community, your insights and experiences hold immense value to us.

Hence, we kindly request your participation in a brief survey designed specifically for our tracer study. Your responses will aid us in comprehensively assessing the impact of our academic programs and initiatives, thereby facilitating strategic improvements for the benefit of current and future students.
  
Your involvement in this endeavor exemplifies your continued commitment to the growth and development of Gordon College – College of Computer Studies. Together, let us embark on this journey towards academic excellence and innovation.
  
Please take a moment to click on the button below and complete the survey. Your cooperation is deeply appreciated, and your contribution will undoubtedly make a difference.
  
Thank you for your unwavering support and dedication to our alma mater. We look forward to receiving your valuable feedback.
  
Warm regards,

Alumni Relations Officer
Gordon College – College of Computer Studies`;
  alumniData: any[] = [];
  content: string = 'Include Group';
  attachments: File[] = [];
  showEmailBox: boolean = true;
  showInput2: boolean = true;
  alumni_email = '';
  today: Date = new Date();
  @Input() isVisible0: boolean = false;
  @Input() isVisible: boolean = false;
  @Input() isVisible1: boolean = false;
  @Input() isVisible2: boolean = false;


  openModal0() {
    this.isVisible0 = true;
  }

  closeModal0() {
    this.isVisible0 = false;
  }

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
  }

  openModal1() {
    this.isVisible1 = true;
  }

  closeModal1() {
    this.isVisible1 = false;
  }

  openModal2() {
    this.isVisible1 = true;
  }

  closeModal2() {
    this.isVisible2 = false;
  }




  ngOnInit() {
    this.showEmailBox = true;
    this.showInput2 = false;
    this.scheduleMail();
    this.keywordsMap['{{Dept}}'] = this.content,
      this.keywordsMap['{{Date}}'] = this.formatDate(this.today)
    this.schedSend();
  }
  part2: string = `

    </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="center">
                            <button><a href="https://gcaco.online/forms/alumni-login"><span class="white">
                                        Go to Form</span></a></button>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <hr>
                        </td>
                    </tr>
                    <tr><td style="padding: 0 30px 0 30px;"><p style="color: red;"><i>Note: you can unsubscribe by: verifying your email in the form >> disagree to the Privacy Act >> Next</i></p></td></tr>
                    <tr>
                        <td class="footer">
                            <footer>
                                © 2022 Gordon College - College of Computer Studies
                            </footer>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>

</html>`;
  part1: string = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
    
            body {
                font-family: 'Poppins', sans-serif;
            }
    
            .body {
                width: 100%;
                background: #e7e7e7 !important;
            }
    
            .main {
                margin: 0px auto;
                width: 100%;
                max-width: 700px;
            }
    
            h1 {
                color: #000000 !important;
                text-align: center;
                line-height: 4vmin;
                font-size: 4vmin;
                padding: 0 3vmin 0 3vmin;
            }
    
            span.green {
                color: green;
            }
    
            span.orange {
                color: #E17713;
            }
    
            img {
                margin: 2vmin 0 0 0;
                width: 100%;
            }
    
            td {
                background-color: whitesmoke !important;
                padding: 1vmin 0 1vmin 0;
            }
    
            p {
                line-height: 3.5vmin;
                font-size: 2.5vmin;
                padding: 0 3vmin 0 3vmin;
                white-space: pre;
                            word-break: break-word;
                            text-wrap: wrap;
            }
    
            button {
                background: green;
                padding: 1vmin 3vmin 1vmin 3vmin;
                border-radius: 1vmin;
                margin: auto;
                cursor: pointer;
                height: auto;
                width: auto;
                font-weight: 500;
                border: none;
            }
    
            span.white {
                color: #ffffff;
            }
    
            a {
                text-align: center;
                text-decoration: none;
    
                font-size: 3vmin;
            }
    
            td.center {
                display: flex;
                padding: 4vmin 2vmin 4vmin 2vmin;
            }
    
            td.footer {
                padding-bottom: 3vmin;
            }
    
            footer {
                margin: auto;
                background-color: #E17713;
                color: white !important;
                text-align: center;
                padding: 1vmin 0 1vmin;
                font-size: 2vmin;
                height: auto;
                width: 100%;
            }
    
            @media (max-width: 768px) {
                h1 {
                    font-size: 6vmin;
                    line-height: 6vmin;
                    padding: 2vmin 2vmin 2vmin 2vmin;
                }
    
                p {
                    line-height: 4vmin;
                    font-size: 3vmin;
                    padding: 2vmin 2vmin 2vmin 2vmin;
                    white-space: pre;
                            word-break: break-word;
                            text-wrap: wrap;
                }
    
                button {
                    padding: 1vmin 2vmin 1vmin 2vmin;
                }
    
                a {
                    font-size: 4vmin;
                }
    
                footer {
                    font-size: 3vmin;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="body">
            <div class="main">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                    style="border-radius: 23px; width:100%">
                    <tbody>
                        <tr>
                            <td>
                                <img
                                    src="https://gcaco.online/assets/images/form-banner.png">
                            </td>
    
                        </tr>
                        <tr>
                            <td>
                                <hr>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <h1>Greetings! Alumnus of
                                    <span class="green">Gordon College</span> - <span class="orange">College of Computer
                                        Studies</span>
                                </h1>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <hr>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <p>`;

  //type selector for dropdown
  //selectedType(newContent: string): void {
  //this.content = newContent;
  //}
  // Keywords for textarea
  keywordsMap: { [key: string]: string } = {
    // Add more keywords and their corresponding values
  };

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-PH', options);
  }
  // Function for replacing keywords in for textarea
  replaceKeywords(message: string): string {
    let replacedMessage = message;
    for (const [keyword, value] of Object.entries(this.keywordsMap)) {
      const regex = new RegExp(keyword, 'g');
      replacedMessage = replacedMessage.replace(regex, value);
    }
    return replacedMessage;
  }
  constructor(public generalService: AuthService, private mailService: AuthService) { }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.attachments = event.target.files;
    }
  }

  sendMail() {

    // Replace keywords with their value in textarea when sending
    const updatedMessage = this.replaceKeywords(this.message);

    let recipients: string[];

    if (this.content === 'CCS' && this.email) {
      recipients = this.email;
    } else if (this.content === 'BSIT' && this.email) {
      recipients = this.email;
    } else if (this.content === 'BSCS' && this.email) {
      recipients = this.email;
    } else if (this.content === 'BSEMC' && this.email) {
      recipients = this.email;
    } else if (this.content === 'ACT' && this.email) {
      recipients = this.email;
    } else {
      if (!this.email) {
        console.error('No email address provided.');
        return;
      }
      recipients = Array.isArray(this.email) ? this.email : [this.email];
    }

    this.sendMailToRecipients(recipients, updatedMessage);

  }

  schedSend() {
  
  }

 

  scheduleMail() {
    if (!this.email.length) {
      console.error('No email addresses fetched.');
      return;
    }

    const recipientsString = this.email.join(',');
    const mailData = {
      email: recipientsString,
      subject: this.subject,
      message: this.part1 + this.message + this.part2,
    };

    this.mailService.schedMail(mailData).subscribe(
      (response) => {
        console.log('Mail scheduled successfully:', response);
      },
      (error) => {
        console.error('Error scheduling mail:', error);
      }
    );
  }

  sendMailToRecipients(recipients: string[], updatedMessage: string) {
    const recipientsString = recipients.join(',');
    const mailData = {
      email: recipientsString,
      subject: this.subject,
      message: this.part1 + updatedMessage + this.part2,
      attachments: this.attachments,
    };

    this.mailService.sendMail(mailData).subscribe(
      (response) => {

        console.log('Mail sent successfully:', response);
        this.isVisible1 = true;
      },
      (error) => {
        console.error('Error sending mail:', error);
        this.isVisible2 = true;
      }
    );
  }

  handleEmailInput(event: any) {
    const inputText = event.target.value;
    const sanitizedInput = inputText.replace(/\n/g, ',');
    const separatedEmails = sanitizedInput.split(/[ ,;]+/);
    const validEmails = separatedEmails.filter(
      (email: string) => email.trim() !== ''
    );
    this.email = validEmails.join(', ');
    this.email = validEmails;
  }
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;

    if (!clickedElement.closest('.input2')) {
      this.showEmailBox = true;
      this.showInput2 = false;
    } else {
      this.showEmailBox = false;
      this.showInput2 = true;
    }

    if (clickedElement.closest('.email-box')) {
      this.showInput2 = !this.showInput2;
      this.showEmailBox = false;
    }
  }

  selectedType(newContent: string): void {
    this.content = newContent;
    // Set the email based on the selected type
    switch (newContent) {
      case 'Include Group':
        this.clearEmails();
        break;
      case 'BSEMC':
     
        break;
      case 'ACT':
      
        break;
      case 'CCS':
       
        break;
      case 'BSIT':
      
        break;
      case 'BSCS':
     
        break;
      default:
        this.email = [];
        break;
    }
  }

  clearEmails() {
    this.email = []; // Set the array of email addresses to an empty array
  }

 



 

 

 
  onSubmit() {

    // Replace keywords with their value in textarea when sending
    const updatedMessage = this.replaceKeywords(this.message);

    let recipients: string;

    switch (this.content) {
      case 'Include Group':
        recipients = this.email.join(', \n');
        break;
      case 'BSEMC':
        recipients = this.email.length > 0 ? `BSEMC alumni:\n${this.email.join(', \n')}` : 'BSEMC alumni:';
        break;
      case 'ACT':
        recipients = this.email.length > 0 ? `ACT alumni:\n${this.email.join(', \n')}` : 'ACT alumni:';
        break;
      case 'CCS':
        recipients = this.email.length > 0 ? `CCS alumni:\n${this.email.join(', \n')}` : 'CCS alumni:';
        break;
      case 'BSIT':
        recipients = this.email.length > 0 ? `BSIT ALUMNI:\n${this.email.join(', \n')}` : 'BSIT ALUMNI:';
        break;
      case 'BSCS':
        recipients = this.email.length > 0 ? `BSCS alumni:\n${this.email.join(', \n')}` : 'BSCS alumni:';
        break;
      default:
        recipients = '';
    }

    const data = {
      mail_subject: this.subject,
      mail_sent_to: recipients,
      mail_message: updatedMessage,
    };

    this.mailService.submitMailHistory(data).subscribe(
      (response) => {

        console.log('Form data submitted successfully:', response);
        console.log(data);
      },
      (error) => {
        console.error('Error submitting form data:', error);
      }
    );
  }

 
}