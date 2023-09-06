const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const session = require("express-session");
const UserModel = require("./models/userModel");
const Appointment = require("./models/appointmentModel");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON body
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));

app.listen(7070, () => {
    console.log("Server running on port 7070");
});
app.get("/", function(req, res) {
    res.render('home', { req: req });
});

app.get('/home', (req, res) => {
    res.render('home', { req: req });
});

app.get('/dashboard', (req, res) => {
    if (req.session.user && req.session.user.userType === 'Driver') {
        res.render('dashboard', { req: req });

        // res.render('dashboard', { req: req });
    } else {
        res.redirect('/login');
    }
});

app.get('/gpage', (req, res) => {
    if (req.session.user && req.session.user.userType === 'Driver') {


        res.render('g_page', { req: req });
    } else {
        res.redirect('/login');
    }
});

app.get('/g2Page', (req, res) => {

    if (req.session.user && req.session.user.userType === 'Driver') {
        res.render('g2_page', { req: req });
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { loginError: null, req: req });
});

app.get('/signup', (req, res) => {
    res.render('signup', { signupError: null, req: req });
});


app.post('/signUp', async(req, res) => {
    try {
        const { username, password, userType } = req.body;
        // Check if the username already exists
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.render('signup', { signupError: 'Username already exists' });
        }

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserModel({
            username,
            password: hashedPassword,
            userType,
            firstname: 'default',
            lastname: 'default',
            LicenseNo: 'default',
            Age: 0,
            car_details: {
                make: 'default',
                model: 'default',
                year: '0',
                platno: 'default'
            }
        });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

app.post('/login', async(req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await UserModel.findOne({ username });
        // console.log("user", user);
        if (!user) {
            return res.render('login', { loginError: 'Invalid username or password' });
        }


        // Compare the password
        // const passwordMatch = await bcrypt.compare(password, user.password);

        const passwordMatch = bcrypt.compare(password, user.password)
        if (!passwordMatch) {
            return res.render('login', { loginError: 'Invalid username or password' });
        }


        // Store user information in session
        req.session.user = user;
        if (req.session.user && req.session.user.userType === 'Admin') {
            // Only the admin can access the appointment creation page
            res.redirect('/appointment');

            // res.render('/appointment', { req: req });
        } else if (req.session.user && req.session.user.userType === 'Driver') {
            // Only the admin can access the appointment creation page
            res.redirect('/g2Page');

            // res.render('g2_page', { req: req });
        } else if (req.session.user && req.session.user.userType === 'Examiner') {

            res.redirect('/examiner');

        }

    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

app.post('/licenseDetails', async(req, res) => {
    try {
        const { fname, lname, lNo, age, dob, c_make, c_model, c_year, plateNo, appointmentDate, selectedAppointmentTime } = req.body;

        // Get the logged-in user's ID from the session (you need to implement session management)
        const loggedUserId = req.session.user._id;
        // Find the logged-in user by ID in the database
        const user = await UserModel.findById(loggedUserId);
        if (user && user.userType === 'Driver') {
            // Update the user's information with the data from the form
            user.fname = fname;
            user.lname = lname;
            user.licenseNo = lNo;
            user.age = age;
            user.dob = dob;
            user.carDetails.make = c_make;
            user.carDetails.model = c_model;
            user.carDetails.year = c_year;
            user.carDetails.plateNo = plateNo;
            user.appointmentDate = appointmentDate;
            user.selectedAppointmentTime = selectedAppointmentTime;

            // Save the updated user data
            await user.save();

            // Redirect back to the G2 page with a success message
            res.render('g2_page', { user_details: true, req: req });

        } else {
            // If the user is not found or not of UserType 'Driver', display an error message
            res.render('g2_page', { user_details: null, notFound: true, req: req });
        }
    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});


app.post('/showDetails', async(req, res) => {
    try {
        const lic_num = req.body.lNo.trim();

        // Find the user by their license details
        const user_details = await UserModel.findOne({ licenseNo: lic_num });



        if (!user_details) {
            res.render('g_page', { user_details: null, notFound: true, req: req });
        } else {
            res.render('g_page', { user_details, req: req });
        }
    } catch (err) {
        res.send(err.message);
    }
});




app.post('/updateDetails', async(req, res) => {
    try {
        const licenseNumber = req.body.lNo;
        const user = await UserModel.findOne({ licenseNo: licenseNumber });

        if (!user) {
            res.render('g_page', { user_details: null, notFound: true, req: req });
        } else {
            user.carDetails.make = req.body.make;
            user.carDetails.model = req.body.model;
            user.carDetails.year = req.body.year;
            user.carDetails.plateNo = req.body.plateNo;

            const updatedUser = await user.save();

            res.render('g_page', { user_details: updatedUser, updated: true, req: req });
        }
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

app.get('/appointment', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Admin') {
        try {
            // Fetch existing appointment slots from the database
            const appointments = await Appointment.find({});
            res.render('appointment', { appointments, req: req });
        } catch (err) {
            console.log(err);
            res.send('Error fetching appointments.');
        }
    } else {
        res.redirect('/login');
    }
});


app.get('/examiner', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Examiner') {
        try {
            let users = [];
            const testTypeFilter = req.query.testType;

            if (testTypeFilter) {
                users = await UserModel.find({ userType: 'Driver', testType: testTypeFilter });
            }

            res.render('examiner_page', { users, req: req, testTypeFilter });
        } catch (err) {
            console.log(err);
            res.send('Error fetching data for examiner.');
        }
    } else {
        res.redirect('/login');
    }
});



// app.post('/addAppointment', async(req, res) => {

//     if (req.session.user && req.session.user.userType === 'Admin') {
//         const { date, time } = req.body;

//         // Check if the appointment slot already exists for the selected date and time
//         const existingAppointment = await Appointment.findOne({ date, time });
//         if (existingAppointment) {
//             const appointments = await Appointment.find({});
//             res.render('appointment', { appointments, errorMessage: 'Appointment slot already exists.', req: req });
//         }

//         // Create a new appointment slot
//         const newAppointment = new Appointment({ date, time });
//         await newAppointment.save();

//         // Redirect back to the appointment page with updated slots
//         res.redirect('/appointment');
//     } else {
//         res.redirect('/login');
//     }
// });


app.post('/addAppointment', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Admin') {
        const { date, time } = req.body;

        // Check if the appointment slot already exists for the selected date and time
        const existingAppointment = await Appointment.findOne({ date, time });
        if (existingAppointment) {
            const appointments = await Appointment.find({});
            res.render('appointment', { appointments, errorMessage: 'Appointment slot already exists.', req: req });
        } else {
            // Create a new appointment slot
            const newAppointment = new Appointment({ date, time });
            await newAppointment.save();

            // Set a success message in session
            // req.session.successMessage = 'Timeslot booked successfully!';
           

            console.log("Success message set:", req.session.successMessage);

            // Redirect back to the appointment page with updated slots
            res.redirect('/appointment');
        }
    } else {
        res.redirect('/login');
    }
});




app.post('/selectAppointment', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Driver') {
        const { date, time } = req.body;
        const selectedAppointment = await Appointment.findOne({ date, time });

        if (!selectedAppointment || !selectedAppointment.isTimeSlotAvailable) {
            // Appointment slot is not available or does not exist
            return res.redirect('/g2Page');
        }

        // Mark the appointment slot as booked
        selectedAppointment.isTimeSlotAvailable = false;
        await selectedAppointment.save();

        // Update the user collection to store the Appointment ID
        const user = await UserModel.findById(req.session.user._id);
        user.appointment = selectedAppointment._id;
        await user.save();

        res.render('g2_page', { appointmentBooked: true, req: req });
    } else {
        res.redirect('/login');
    }
});

// Add a new route to handle the POST request for fetching available appointments
app.post('/getAvailableAppointments', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Driver') {
        const { date } = req.body;
        const selectedDate = req.body.date;
        try {
            // Fetch available appointments for the selected date from the database
            const availableAppointments = await Appointment.find({ date: selectedDate });
            res.json(availableAppointments);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Error fetching available appointments.' });
        }
    } else {
        res.status(403).json({ error: 'Unauthorized access.' });
    }
});


// app.get('/appointment', async(req, res) => {
//     if (req.session.user && req.session.user.userType === 'Admin') {
//         try {
//             // Fetch existing appointment slots from the database
//             const appointments = await Appointment.find({});
//             res.render('appointment', { appointments, req: req });
//         } catch (err) {
//             console.log(err);
//             res.send('Error fetching appointments.');
//         }
//     } else {
//         res.redirect('/login');
//     }
// });


app.get('/appointment', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Admin') {
        try {
            // Fetch existing appointment slots from the database
            const appointments = await Appointment.find({});

            // Retrieve the success message from the session, if it exists
            const successMessage = req.session.successMessage;


            console.log("Success message retrieved:", successMessage);
            // Delete the success message from the session to avoid showing it again
            delete req.session.successMessage;

            res.render('appointment', { appointments, successMessage, req: req });
        } catch (err) {
            console.log(err);
            res.send('Error fetching appointments.');
        }
    } else {
        res.redirect('/login');
    }
});




app.post('/addCommentAndStatus', async(req, res) => {
    try {
        const userId = req.body.userId;
        const user = await UserModel.findById(userId);
        console.log("user", user);
        if (!user) {
            res.redirect('/examiner');
        } else {
            const { comment, status } = req.body;
            user.examinerComment = comment;
            user.isPassed = status === 'pass';
            await user.save();
            res.redirect('/examiner');
        }
        console.log("user", user);

    } catch (err) {
        console.log(err);
        res.send('Error updating comment and status.');
    }
});

app.get('/admin', async(req, res) => {
    if (req.session.user && req.session.user.userType === 'Admin') {
        try {
            const passFailUsers = await UserModel.find({ $or: [{ isPassed: true }, { isPassed: false }] });
            res.render('admin_page', { passFailUsers, req: req });
        } catch (err) {
            console.log(err);
            res.send('Error fetching pass/fail user data for admin.');
        }
    } else {
        res.redirect('/login');
    }
});



app.get('/logout', (req, res) => {
    // Clear the user session (log out the user)
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            res.send('Error logging out.');
        } else {
            res.redirect('/');
        }
    });
});