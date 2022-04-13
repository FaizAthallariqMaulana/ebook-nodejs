var express = require("express");
var router = express.Router();
var authentication_mdl = require("../middlewares/authentication");

// var multer = require('multer');
// var app = require('../app');

// var fileStorage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'images'); 
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, new Date().toString() + '-' + file.originalname)
// 	}
// })

// var fileFilter = (req, file, cb) => {
// 	if(
// 		file.mimetype === 'image/png' || 
// 		file.mimetype === 'image/jpg' || 
// 		file.mimetype === 'image/jpeg'
// 	){
// 		cb(null, true);
// 	} else {
// 		cb(null, false);
// 	}
// }

// app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

var session_store;
/* GET Book page. */
router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM book",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("book/list", {
          title: "Books",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var book = {
        id: req.params.id,
      };

      var delete_sql = "delete from book where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          book,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/books");
            } else {
              req.flash("msg_info", "Delete book Success");
              res.redirect("/books");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM book where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/books");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "book can't be find!");
              res.redirect("/books");
            } else {
              console.log(rows);
              res.render("book/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("judul", "Please fill the judul").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_judul = req.sanitize("judul").escape().trim();
      v_pengarang = req.sanitize("pengarang").escape().trim();
      v_penerbit = req.sanitize("penerbit").escape().trim();
      v_gambar = req.sanitize("gambar").escape();

      var book = {
        judul: v_judul,
        pengarang: v_pengarang,
        penerbit: v_penerbit,
        gambar: v_gambar,
      };

      var update_sql = "update book SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          book,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("book/edit", {
                judul: req.param("judul"),
                pengarang: req.param("pengarang"),
                penerbit: req.param("penerbit"),
                gambar: req.param("gambar"),
              });
            } else {
              req.flash("msg_info", "Update book success");
              res.redirect("/books/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/books/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("judul", "Please fill the judul").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_judul = req.sanitize("judul").escape().trim();
    v_penerbit = req.sanitize("penerbit").escape().trim();
    v_pengarang = req.sanitize("pengarang").escape().trim();
    v_gambar = req.sanitize("gambar").escape();

    var book = {
      judul: v_judul,
      pengarang: v_pengarang,
      penerbit: v_penerbit,
      gambar: v_gambar,
    };

    var insert_sql = "INSERT INTO book SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        book,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("book/add-book", {
              judul: req.param("judul"),
              pengarang: req.param("pengarang"),
              penerbit: req.param("penerbit"),
              gambar: req.param("gambar"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create book success");
            res.redirect("/books");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("book/add-book", {
      judul: req.param("judul"),
      pengarang: req.param("pengarang"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("book/add-book", {
    title: "Add New Book",
    judul: "",
    penerbit: "",
    gambar: "",
    pengarang: "",
    session_store: req.session,
  });
});

module.exports = router;
