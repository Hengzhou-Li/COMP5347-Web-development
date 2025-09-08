# TUT2-GROUP5

## Getting Start

### structure

---
````
├── client/ # Frontend React application
│ ├── public/ # Static assets
│ │ └── dataset_dev/ #given data and graphs
│ └── src/ # React source code
│   ├── components/ #function components (e.g. Navbar.jsx...)
│   ├── context/ 
│   ├── pages/ #Interface page
│   │ ├── Admin/ #admin page
│   │ │ └── AdminLogin.jsx
│   │ │ └── ... #other page for Admin  (e.g. User Management, Listing Mangement...)
│   │ ├── Auth/ #user page
│   │ │ └── Cart.jsx
│   │ │ └── Login.jsx
│   │ │ └── ... #other page for User (e.g. ResetPassword, Signup...)
│   │ ├── Home.jsx
│   │ ├── Main_page.jsx
│   │ ├── allPages.css
│   │ └── Profile.jsx
│   ├── routes/
│   │ ├── UserRoute.css
│   │ └── AdminRoute.jsx
│   ├── utils/
│   │ └── RequireAuth.js
│   ├── App.css 
│   ├── App.js
│   ├── index.css 
│   └── index.js
├── server/ # Backend Node.js + Express
│ ├── controllers/
│ │ ├── adminController.js
│ │ └── ... #other controllers
│ ├── models/ # Database schema
│ │ ├── Cart.js
│ │ └── ... #other models
│ ├── routes/ # API
│ │ ├── admin.js
│ │ └── ... #other routes
│ ├── utils/
│ │ ├── LogAction.js  # Record admin actions
│ │ └── sendEmail.js  # Send email function
│ └── .env # Environments
└── README.md # Project documentation
````
### Environment Requirements
- Node.js `>= 18.0.0`
- MongoDB (Local MongoDB or MongoDB Compass GUI recommended)
- npm 

### Install Dependencies
```bash
cd client
npm install
```
```bash
cd ../server
npm install
```
#### Key dependencies include:
- **express** Web framework
- **mongoose** MongoDB ODM
- **bcrypt** Password hashing
- **jsonwebtoken** Token-based authentication
- **cors** Cross-origin resource sharing
- **nodemon** Development auto-reloader
- **@sendgrid/mail** SendGrid email API integration
- 
#### Admin Account:
```json
email: admin@example.com
password: 123456
```
  
To access admin system, you should go to http://localhost:3000/admin

## Running the Project
### Start the Datebase
Make sure MongoDB is running locally or remotely
### Start the Backend Server
```bash
cd server
npm run dev
```
By default it runs at http://localhost:5000
### Start the Frontend Application
```bash
cd client
npm start
```
By default it runs at http://localhost:3000

## Import Initial Data
Use **MongoDB Compass** to import:
- _`phonelisting.json`_ into `phones` collection
- `userlist.json` into `users` collection
### Example data objects of Phones:
```json
[
    …
    {
        "title": "Galaxy s III mini SM-G730V Verizon Cell Phone BLUE",
        "brand": "Samsung",
        "image": "imageurl",
        "stock": 9,
        "seller": "5f5237a4c1beb1523fa3db73",
        "price": 56.0,
        "reviews": [
          {
            "reviewer": "5f5237a4c1beb1523fa3db1f",
            "rating": 3,
            "comment": "Got phone yesterday all ... the charger!",
            "hidden": ""
          },
          {
            "reviewer": "5f5237a4c1beb1523fa3db1f",
            "rating": 5,
            "comment": "The charging cable is ... phone was good!"
          }
        ]
    },
    …
    {
        "title": "Sony Ericsson TM506 Unlocked QUAD-Band 3G GSM CellPhone",
        "brand": "Sony",
        "image": "imageurl",
        "stock": 0,
        "seller": "5f5237a4c1beb1523fa3da68",
        "price": 173.0,
        "reviews": [],
        "disabled": ""
    },
…
```
### Example data objects of Users:
```json
[
    …
    {
        "_id":{"$oid":"5f5237a4c1beb1523fa3da04"},
        "firstname":"Robert",
        "lastname":"Vasques",
        "email":"robert.vasques@piedpiper.com",
        "password":"<put the encrypted password here>"
    },
    {
        "_id":{"$oid":"5f5237a4c1beb1523fa3da05"},
        "firstname":"Jimmy",
        "lastname":"Sagedahl",
        "email":"jimmy.sagedahl@hooli.com",
        "password":"<put the encrypted password here>"
    },
…
```

## Email Setup(SendGrid)
To enable email notification, add the following to `.env` file(There already is a verified sender in `.env` file):
```ini
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=verified_sender_email@example.com
```
> **Note**: EMAIL_FROM must be a verified sender in SendGrid account in order to make sendgrid work



