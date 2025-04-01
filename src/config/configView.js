const path = require('path');
const express = require('express');

const configView = (app)=> {
    console.log("ddd",__dirname);
    app.set('views', './src/views')
    app.set('view engine', 'ejs')
    app.use(express.static(path.join('./src', 'public')))
}
module.exports = configView;