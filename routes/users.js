var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var mssql = require('mssql');

//Mssql DB Config
var dbconfig = {
    server: 'faxtimedb.database.windows.net',
    user: 'faxtime',
    password: 'test2016!',
    options: {
        debug: {
            packet: false,
            data: false,
            patload: false,
            token: false,
            log: true
        },
        encrypt: true,
        database: 'taihoML2'
    }
};

//DB Connection
var connection = new mssql.Connection(dbconfig, function (err) {
    if (err != null) {
        console.log("DB Connection Error : " + err);
    }
});
var request = new mssql.Request(connection);

/* GET users listing. */
var pageCount = 10;

router.get('/', function(req, res, next) {
    fs.readFile('./users.html', 'utf-8', function (error, data) {
        if (error) {
            console.log("readFile error : " + error);
        } else {
            var totPageCount = 0;
            var currentPage = 1;
            var startPage = 1;
            var endPage = 0;

            //select total rows.
            var selectQuery = 'SELECT ' + 
                                'u.sid, u.user_number, u.customer_comment, c.chatbot_comment, u.channel, u.response_time, u.reg_date, u.active_flag ' +
                              'FROM ' +
                                'tbl_unlabeled_query u, tbl_chatbot_comment c ' +
                              'WHERE ' +
                                'u.chatbot_comment_code = c.sid ' +
                              'AND ' +
                                'u.active_flag = 0 ';
            request.query(selectQuery, function (err, recordset) {
                if (err) {
                    console.log("DB error : " + err);
                } else {
                    totPageCount = Math.ceil(Object.keys(recordset).length / pageCount);
                    if (totPageCount <= 10) {
                        endPage = totPageCount;
                    } else {
                        endPage = 10;
                    }

                }

                //select first page rows.
                selectQuery = 'SELECT * ' +
                              'FROM( ' +
                                'SELECT ' +
                                    'ROW_NUMBER() OVER(order by u.sid desc) AS rownum, u.sid, CONVERT(char(23),u.user_number, 121) AS user_number, ' +
                                    'u.customer_comment, c.chatbot_comment, u.channel, u.response_time, u.reg_date, u.active_flag ' +
                                'FROM ' +
                                    'tbl_unlabeled_query u, tbl_chatbot_comment c ' +
                                'WHERE ' +
                                    'u.chatbot_comment_code = c.sid ' +
                                'AND u.active_flag = 0 ' +
                              ') A ' +
                              'WHERE ' +
                                'rownum > 0 ' +
                              'AND ' +
                                'rownum <= 10';
                request.query(selectQuery, function (err, recordset) {
                    if (err) {
                        console.log("DB error : " + err);
                    } else {
                        var params = {
                            result: recordset,
                            totPageCount: totPageCount,
                            currentPage: currentPage,
                            pageCount: pageCount,
                            startPage: startPage,
                            endPage: endPage
                        };
                        res.send(ejs.render(data, params));
                    }
                });
            });
        }
    });
});

router.get('/paging', function (req, res, next) {
    var currentPage = Number(req.query.currentPage);
    var totPageCount = Number(req.query.totPageCount);
    var pageCount = Number(req.query.pageCount);
    var startPage = Number(req.query.startPage);
    var endPage = Number(req.query.endPage);

    if (startPage > currentPage) {
        if (1 <= currentPage && currentPage <= pageCount) {      
            startPage = 1;
            endPage = pageCount;     
        } else {
            startPage -= pageCount;
            endPage = currentPage;           
        }
    } else if (currentPage > endPage) {
        if ((totPageCount - currentPage) >= pageCount) {           
            startPage += pageCount;
            endPage = startPage + pageCount - 1;
        } else {
            startPage = (parseInt(totPageCount / pageCount) * pageCount) + 1;
            endPage = totPageCount;         
        }
    }
    
    //select currentPage rows.
    selectQuery = 'SELECT * ' +
                  'FROM( ' +
                        'SELECT ' +
                            'ROW_NUMBER() OVER(order by u.sid desc) AS rownum, u.sid, CONVERT(char(23),u.user_number, 121) AS user_number, ' +
                            'u.customer_comment, c.chatbot_comment, u.channel, u.response_time, u.reg_date, u.active_flag ' +
                        'FROM ' +
                            'tbl_unlabeled_query u, tbl_chatbot_comment c ' +
                        'WHERE ' +
                            'u.chatbot_comment_code = c.sid ' +
                        'AND ' +
                            'u.active_flag = 0' +
                  ') A ' +
                  'WHERE ' +
                        'rownum > ' + ((currentPage - 1) * 10) + ' ' +
                  'AND ' +
                         'rownum <=  ' + (currentPage * 10);
    request.query(selectQuery, function (err, recordset) {
        if (err) {
            console.log("DB error : " + err);
        } else {
            var params = {
                result: recordset,
                totPageCount: totPageCount,
                currentPage: currentPage,
                pageCount: pageCount,
                startPage: startPage,
                endPage: endPage
            };
            res.send(params);
        }
    });
});

router.get('/delete', function (req, res, next) {
    var currentPage = Number(req.query.currentPage);
    var totPageCount = Number(req.query.totPageCount);
    var pageCount = Number(req.query.pageCount);
    var startPage = Number(req.query.startPage);
    var endPage = Number(req.query.endPage);
    var sid = Number(req.query.deleteSid);

    //update 1 row.
    var UpdateQuery = 'UPDATE ' +
                        'tbl_unlabeled_query ' +
                      'SET ' +
                        'active_flag = 1 ' +
                      'WHERE ' +
                        'sid = ' + sid;

    request.query(UpdateQuery, function (err, result) {
        if (err) {
            console.log("DB error : " + err);
        } else {
            res.send(result);
        }
    });
});

module.exports = router;