import nodemailer from "nodemailer"

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    host: 'onlinenursingexperts.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: 'support@onlinenursingexperts.com',
      pass: 'Nthigah@2022'
    }
  });
  
  // setup email data
  const mailOptions = {
    from: {
        name: 'Bei Fity Support',
        address: 'support@onlinenursingexperts.com'
    },
    bcc:'lessin915@gmail.com',
    to:options.to,
    subject: options.subject,
    text: options.text,
    html:options.html
  };
  
  // send email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent successfully ');
    }
  });
}

export default sendEmail