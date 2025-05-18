const express = require('express');
const path = require("path");
const bodyParser = require('body-parser');
const app = express();
const portNumber = 3000;
const fetch = require('node-fetch');
 
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Mount routes from lifterRoutes
const lifterRoutes = require("./routes/lifterRoutes");
app.use("/", lifterRoutes);

app.post("/suggest", async (req, res) => {
    const muscleMap = {
    "Bench Press": "pectorals",
    "Squat": "quads",
    "Deadlift": "glutes"
    };

    const lift = req.body.lift;
    const muscleGroup = muscleMap[lift] || "chest"; // Default fallback
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    try {
        const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/target/${muscleGroup}`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
            }
        });

        if (!response.ok) throw new Error(`API error: ${response.statusText}`);
        const data = await response.json();

        const selectedExercises = data.slice(0, 5);
        res.render("suggestions.ejs", { exercises: selectedExercises });
    } catch (error) {
        console.error("Exercise API error:", error);
        res.send("Error fetching suggested exercises.");
    }
});


// Start the server
app.listen(portNumber, () => {
    console.log(`Server running at http://localhost:${portNumber}`);
    process.stdout.write("Stop to shutdown the server: ");
    process.stdin.setEncoding("utf8");
    process.stdin.on('readable', () => {
        const dataInput = process.stdin.read();
        if(dataInput !== null){
            const command = dataInput.trim();
            if(command.toLowerCase() === "stop"){
                process.stdout.write("Shutting down the server");
                process.exit(0);
            }else{
                console.log(`Invalid command: ${command}`)
            }
            process.stdin.resume();
            process.stdout.write("Stop to shutdown the server: ");
        }
    })
});
