const express = require('express')
const path = require('path')
const app = express()
const portnum = 3000

app.get('/feed/home/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/home.json'))
})

app.get('/feed/navigation/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/navigation.json'))
})

app.get('/feed/contact/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/contact.json'))
})

app.get('/feed/portfolio/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/portfolio.json'))
})

app.get('/feed/projects/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/projects.json'))
})

app.get('/feed/product-categories/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/product-categories.json'))
})

app.get('/feed/staging/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/staging.json'))
})

app.get('/feed/about/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/about.json'))
})

app.get('/feed/shop/', function (req, res) {
    res.sendFile(path.join(proj_root, 'server/mock-data/shop.json'))
})

const proj_root = path.join(__dirname, '../')
console.log('Project root is set to ' + proj_root)
// static resources
app.get('/', function (req, res) {
    res.sendFile(path.join(proj_root, 'client/index.html'))
})
app.get('/favicon.ico', function (req, res) {
    res.sendFile(path.join(proj_root, 'client/favicon.ico'))
})

app.use('/partials', express.static(path.join(proj_root, 'client/partials')))
app.use('/js', express.static(path.join(proj_root, 'client/js')))
app.use('/css', express.static(path.join(proj_root, 'client/css')))
app.use('/img', express.static(path.join(proj_root, 'client/img')))
app.use('/uploads', express.static(path.join(proj_root, 'uploads')))

app.listen(portnum)
console.log('server started at ' + portnum);