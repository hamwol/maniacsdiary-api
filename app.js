var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const mysql = require('mysql');
const client = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
});

const cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors())
client.connect();
client.query('use maniacsdiary');

app.get('/list', cors(), (req, res) =>{
  if(req.query.search === undefined){
    client.query('select * from nodes order by time desc', (err, rows, fields)=>{
      if (err) console.log(err);
      res.send(rows);  
    })
  } else {
    client.query('select * from nodes where `subject` like \'%' + req.query.search + '%\' order by time desc', (err, rows, fields)=>{
      if (err) console.log(err);
      res.send(rows);  
    })

  }
})

app.post('/insert', cors(), (req, res) => {
  const body = req.body
  client.query('insert into nodes (`index`, season, `subject`, episode, star, content) values (?,?,?,?,?,?)', 
    [body.index, body.season, body.subject, body.episode, body.star, body.content], (err, rows, fields)=>{
      if(err) console.log(err)
      res.send(rows)
  })
})

app.delete('/delete/:id', cors(), (req, res) => {
  client.query('delete from nodes where idx=?', [req.params.id], (err, rows, fields)=>{
    if(err) console.log(err)
    res.send(rows)
  })
})

app.put('/update/:id', cors(), (req, res) => {
  const body = req.body
  client.query('update nodes set `index` = ?, season = ?, `subject` = ?, episode = ?, star = ?, content = ? where idx = ?',
  [body.index, body.season, body.subject, body.episode, body.star, body.content, req.params.id], (err, rows, fields)=>{
    if(err) console.log(err)
    res.send(rows)
  })
})

//client.end();





app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;
