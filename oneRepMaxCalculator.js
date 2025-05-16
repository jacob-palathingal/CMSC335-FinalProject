const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const portNumber = 3000;

require("dotenv").config({ path: path.resolve(__dirname, '.env') });

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files like styles.css from public folder
app.use(express.static(path.join(__dirname, "public")));

// Mount your routes from lifterRoutes
const lifterRoutes = require("./routes/lifterRoutes");
app.use("/", lifterRoutes);

// Standalone route: API usage for exercise suggestions
app.get("/suggest", async (req, res) => {
    const muscleGroup = "chest"; // TEMP: You can make this dynamic later
    try {
        const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/target/${muscleGroup}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });
        const data = await response.json();
        const selectedExercises = data.slice(0, 5);
        res.render("suggestions.ejs", { exercises: selectedExercises });
    } catch (error) {
        console.error(error);
        res.send("Error fetching exercises");
    }
});

// Start the server
app.listen(portNumber, () => {
    console.log(`Server running at http://localhost:${portNumber}`);
});
