const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Goal = require('./models/goal');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);

app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/goals', async (req, res) => {
  console.log('pokusaj dohvatanja ciljeva');
  try {
    const goals = await Goal.find();
    res.status(200).json({
      goals: goals.map((goal) => ({
        id: goal.id,
        text: goal.text,
      })),
    });
    console.log('ciljevi');
  } catch (err) {
    console.error('greska pri dohvatanju ciljeva');
    console.error(err.message);
    res.status(500).json({ message: 'Greska pri prikazu ciljeva.' });
  }
});

app.post('/goals', async (req, res) => {
  console.log('Pokusaj snimanja cilja');
  const goalText = req.body.text;

  if (!goalText || goalText.trim().length === 0) {
    console.log('nevalidan ulaz - nema teksta');
    return res.status(422).json({ message: 'nevalidan tekst cilja.' });
  }

  const goal = new Goal({
    text: goalText,
  });

  try {
    await goal.save();
    res
      .status(201)
      .json({ message: 'Snimljen cilj', goal: { id: goal.id, text: goalText } });
    console.log('Snimljen novi cilj');
  } catch (err) {
    console.error('Greska pri snimanju ciljeva');
    console.error(err.message);
    res.status(500).json({ message: 'Greska pri snimanju' });
  }
});

app.delete('/goals/:id', async (req, res) => {
  console.log('pokusaj brisanja cilja');
  try {
    await Goal.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Izbrisan cilj!' });
    console.log('Izbrisan cilj!');
  } catch (err) {
    console.error('Greska pri brisanju!');
    console.error(err.message);
    res.status(500).json({ message: 'Greska pri brisanju.' });
  }
});

mongoose.connect(
  'mongodb://localhost:27017/course-goals',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.error('Greska pri spajanju na MONGODB');
      console.error(err);
    } else {
      console.log('Spojen sa MONGODB');
      app.listen(80);
    }
  }
);
