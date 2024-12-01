const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình kết nối với SQL
const config = {
  host: "192.168.1.30",
  user: "root",
  password: "",
  database: "db_videosharingapp",
};

// Kết nối MySQL
const pool = mysql.createPool(config);

// API Endpoint để lấy danh sách người dùng
app.get("/account", (req, res) => {
  pool.query(
    `SELECT u.*, a.username as account_user, a.pass 
     FROM Account a 
     INNER JOIN Users u ON a.idUser = u.idUser`,
    (err, results) => {
      if (err) {
        console.log("Error fetching Accounts from MySQL:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results); // Trả về dữ liệu
    }
  );
});

app.get("/data", (req, res) => {
  let id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ error: "Invalid ID parameter. Must be a number." });
  }
  pool.query(`SELECT * FROM Users WHERE idUser = ?`, [id], (err, results) => {
    if (err) {
      console.log("Error fetching data from MySQL:", err);
      return res.status(500).send("Server Error");
    }
    res.json(results);
  });
});

// API Endpoint để lấy danh sách follow
app.get("/follow", (req, res) => {
  let id = parseInt(req.query.id, 10); // Parse id to an integer
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ error: "Invalid ID parameter. Must be a number." });
  }
  pool.query(
    `SELECT 
      SUM(CASE WHEN f.id_following = ? THEN 1 ELSE 0 END) AS following_count,
      SUM(CASE WHEN f.id_followed = ? THEN 1 ELSE 0 END) AS followers_count
    FROM Follow f`,
    [id, id],
    (err, results) => {
      if (err) {
        console.log("Error fetching follow counts:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy danh sách người đang theo dõi người dùng (followed)
app.get("/followed", (req, res) => {
  let id = parseInt(req.query.id, 10); // Lấy id người dùng
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ error: "Invalid ID parameter. Must be a number." });
  }
  pool.query(
    `SELECT f.id_following, u.*
     FROM Follow f
     INNER JOIN Users u ON u.idUser = f.id_following
     WHERE f.id_followed = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.log("Error fetching followed:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy danh sách người mà người dùng đang theo dõi (following)
app.get("/following", (req, res) => {
  let id = parseInt(req.query.id, 10); // Lấy id người dùng
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ error: "Invalid ID parameter. Must be a number." });
  }
  pool.query(
    `SELECT f.id_followed, u.*
     FROM Follow f
     INNER JOIN Users u ON u.idUser = f.id_followed
     WHERE f.id_following = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.log("Error fetching following:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// Same fix applied to other routes
app.get("/profilevideos", (req, res) => {
  let id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ error: "Invalid ID parameter. Must be a number." });
  }
  pool.query(
    `SELECT p.url, p.idPost, u.idUser, u.avatar FROM Post p INNER JOIN Users u
     ON p.idUser = u.idUser WHERE p.type= 'video' AND p.idUser = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.log("Error fetching profile videos:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// endpoint lay danh sach anh profile
app.get("/profileimages", (req, res) => {
  let id = parseInt(req.query.id, 10);
  if (isNaN(id)) {
    return res
      .status(400)
      .json({ error: "Invalid ID parameter. Must be a number." });
  }
  pool.query(
    `SELECT p.url, p.idPost, u.idUser, u.avatar FROM Post p INNER JOIN Users u
     ON p.idUser = u.idUser WHERE p.type= 'image' AND p.idUser = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.log("Error fetching profile images:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

app.get("/videoStreaming", (req, res) => {
  pool.query(
    `SELECT * FROM Post p 
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE p.type = 'video'
     ORDER BY p.idPost DESC`,
    (err, results) => {
      if (err) {
        console.log("Error fetching video details:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

app.get("/imageStreaming4", (req, res) => {
  pool.query(
    `SELECT * FROM Post p 
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE p.type = 'image'
     ORDER BY p.idPost DESC
     LIMIT 4`,
    (err, results) => {
      if (err) {
        console.log("Error fetching image details:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

app.get("/imageStreaming", (req, res) => {
  pool.query(
    `SELECT * FROM Post p 
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE p.type = 'image'
     ORDER BY p.idPost DESC`,
    (err, results) => {
      if (err) {
        console.log("Error fetching image details:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy danh sách video in profile
app.get("/profilevideos", (req, res) => {
  const { id } = req.query;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).send("Invalid id parameter");
  }
  pool.query(
    `SELECT p.url FROM Post p 
     INNER JOIN Users u ON p.idUser = u.idUser 
     WHERE p.type = 'video' AND p.idUser = ? 
     ORDER BY p.idPost DESC`,
    [parsedId],
    (err, results) => {
      if (err) {
        console.log("Error fetching profile videos:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy danh sách videoDetails
app.get("/videoDetails", (req, res) => {
  const { id } = req.query;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).send("Invalid id parameter");
  }
  pool.query(
    `SELECT * FROM Post WHERE idPost = ?`,
    [parsedId],
    (err, results) => {
      if (err) {
        console.log("Error fetching video details:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy danh sách comment cua 1 video
app.get("/comment", (req, res) => {
  const { id } = req.query;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).send("Invalid id parameter");
  }
  pool.query(
    `SELECT c.text, c.time, u.avatar, u.username 
     FROM Comment c 
     INNER JOIN Post p ON c.idPost = p.idPost 
     INNER JOIN Users u ON u.idUser = c.idUser 
     WHERE p.idPost = ? 
     ORDER BY p.idPost DESC`,
    [parsedId],
    (err, results) => {
      if (err) {
        console.log("Error fetching comments:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy số lượng comment cua 1 video
app.get("/commentCount", (req, res) => {
  const { id } = req.query;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).send("Invalid id parameter");
  }

  pool.query(
    `SELECT COUNT(*) AS comment_count FROM Comment WHERE idPost = ?`,
    [parsedId],
    (err, results) => {
      if (err) {
        console.log("Error fetching comments:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// API Endpoint để lấy số lượng Like cua 1 video
app.get("/likeCount", (req, res) => {
  const { id } = req.query;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).send("Invalid id parameter");
  }

  pool.query(
    `SELECT COUNT(*) AS like_count FROM \`Like\` WHERE idPost = ?`,
    [parsedId],
    (err, results) => {
      if (err) {
        console.log("Error fetching likes:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// Endpoint để lưu bài viết mới
app.post("/savePost", (req, res) => {
  const { idUser, type, url, content } = req.body;
  if (!idUser || !type || !url || !content) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp idUser, type, url và content." });
  }

  pool.query(
    `INSERT INTO Post (idUser, type, url, content, upload_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [idUser, type, url, content],
    (err, results) => {
      if (err) {
        console.error("Lỗi cơ sở dữ liệu:", err);
        return res
          .status(500)
          .json({ error: "Lỗi khi lưu bài viết vào cơ sở dữ liệu." });
      }
      res.status(201).json({ message: "Bài viết đã được lưu thành công!" });
    }
  );
});

// Update Profile Endpoint
app.put("/updateProfile", (req, res) => {
  const { idUser, username, avatar, sdt, email, birthDay } = req.body;

  if (!idUser || !username || !sdt || !email || !birthDay) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    UPDATE Users
    SET 
      username = ?,
      avatar = ?,
      sdt = ?,
      email = ?,
      birthDay = ?
    WHERE idUser = ?
  `;

  pool.query(
    query,
    [username, avatar, sdt, email, new Date(birthDay), idUser],
    (err, results) => {
      if (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({ message: "Internal server error" });
      }
      if (results.affectedRows > 0) {
        res.status(200).json({ message: "Profile updated successfully" });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    }
  );
});

// Endpoint để lưu bài viết mới
app.post("/insertComment", (req, res) => {
  const { idPost, idUser, text } = req.body;

  if (!idUser || !idPost || !text) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp idUser, idPost và text." });
  }

  const query = `
    INSERT INTO Comment (idUser, idPost, text, time)
    VALUES (?, ?, ?, NOW())
  `;

  pool.query(query, [idUser, idPost, text], (err, results) => {
    if (err) {
      console.error("Lỗi cơ sở dữ liệu:", err);
      return res
        .status(500)
        .json({ error: "Lỗi khi thêm bình luận vào cơ sở dữ liệu." });
    }
    res.status(201).json({ message: "Bình luận thành công!" });
  });
});

// Endpoint để tao account end user
app.post("/register", (req, res) => {
  const { username, sdt, email, accname, pass } = req.body;
  if (!username || !sdt || !email || !accname || !pass) {
    return res
      .status(400)
      .json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
  }

  const queryUser = `
    INSERT INTO Users (username, sdt, email, avatar, birthDay)
    VALUES (?, ?, ?, 'https://res-academy.cache.wpscdn.com/images/b1bc87981be4dc512c611e408ce6bbb2.png', NOW())
  `;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Lỗi kết nối cơ sở dữ liệu:", err);
      return res.status(500).json({ error: "Lỗi kết nối cơ sở dữ liệu." });
    }

    connection.beginTransaction(async (err) => {
      if (err) {
        connection.release();
        console.error("Lỗi bắt đầu giao dịch:", err);
        return res.status(500).json({ error: "Lỗi bắt đầu giao dịch." });
      }

      try {
        const [resultUser] = await connection.query(queryUser, [
          username,
          sdt,
          email,
        ]);
        const idUser = resultUser.insertId;

        const queryAccount = `
          INSERT INTO Account (idUser, username, pass)
          VALUES (?, ?, ?)
        `;
        await connection.query(queryAccount, [idUser, accname, pass]);

        connection.commit((err) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              console.error("Lỗi commit giao dịch:", err);
              return res.status(500).json({ error: "Lỗi commit giao dịch." });
            });
          } else {
            connection.release();
            res.status(201).json({ message: "Tạo tài khoản thành công!" });
          }
        });
      } catch (error) {
        connection.rollback(() => {
          connection.release();
          console.error("Lỗi cơ sở dữ liệu:", error);
          res.status(500).json({ error: "Lỗi khi tạo tài khoản." });
        });
      }
    });
  });
});

app.get("/is-following", (req, res) => {
  const { id_following, id_followed } = req.query;

  // Kiểm tra đầu vào
  if (!id_following || !id_followed) {
    return res
      .status(400)
      .json({ error: "Thiếu id_following hoặc id_followed" });
  }

  pool.query(
    `SELECT COUNT(*) AS is_following
     FROM Follow
     WHERE id_following = ? AND id_followed = ?`,
    [parseInt(id_following), parseInt(id_followed)],
    (err, results) => {
      if (err) {
        console.error("Lỗi kiểm tra follow:", err);
        return res
          .status(500)
          .json({ error: "Lỗi khi kiểm tra trạng thái follow." });
      }

      // Lấy giá trị is_following (0 hoặc 1)
      const isFollowing = results[0].is_following > 0;

      res.status(200).json({ isFollowing });
    }
  );
});

// Endpoint để theo dõi người dùng
app.post("/follow", (req, res) => {
  const { idFollowing, idFollowed } = req.body;
  pool.query(
    `INSERT INTO Follow (id_following, id_followed)
     VALUES (?, ?)`,
    [parseInt(idFollowing), parseInt(idFollowed)],
    (err, results) => {
      if (err) {
        console.error("Lỗi khi theo dõi:", err);
        return res.status(500).json({ error: "Lỗi khi theo dõi người dùng." });
      }
      res.status(200).json({ message: "Đã theo dõi người dùng thành công" });
    }
  );
});

// Endpoint để hủy theo dõi người dùng
app.delete("/unfollow", (req, res) => {
  const { idFollowing, idFollowed } = req.body;
  pool.query(
    `DELETE FROM Follow
     WHERE id_following = ? AND id_followed = ?`,
    [parseInt(idFollowing), parseInt(idFollowed)],
    (err, results) => {
      if (err) {
        console.error("Lỗi khi hủy theo dõi:", err);
        return res
          .status(500)
          .json({ error: "Lỗi khi hủy theo dõi người dùng." });
      }
      res
        .status(200)
        .json({ message: "Đã hủy theo dõi người dùng thành công" });
    }
  );
});

app.get("/is-like", (req, res) => {
  const { idPost, idUser } = req.query;

  // Kiểm tra đầu vào
  if (!idPost || !idUser) {
    return res.status(400).json({ error: "Thiếu idPost hoặc idUser" });
  }

  pool.query(
    `SELECT COUNT(*) AS is_like
     FROM Likes
     WHERE idPost = ? AND idUser = ?`,
    [parseInt(idPost), parseInt(idUser)],
    (err, results) => {
      if (err) {
        console.error("Lỗi kiểm tra Like:", err);
        return res
          .status(500)
          .json({ error: "Lỗi khi kiểm tra trạng thái Like." });
      }

      // Lấy giá trị is_Like (0 hoặc 1)
      const is_Like = results[0].is_like > 0;

      res.status(200).json({ is_Like });
    }
  );
});

app.post("/like", (req, res) => {
  const { idUser, idPost } = req.body;
  pool.query(
    `INSERT INTO Likes (idUser, idPost) VALUES (?, ?)`,
    [parseInt(idUser), parseInt(idPost)],
    (err, results) => {
      if (err) {
        console.error("Error liking post:", err);
        return res.status(500).send("Server error");
      }
      res.status(200).send({ message: "Liked successfully" });
    }
  );
});

app.post("/unlike", (req, res) => {
  const { idUser, idPost } = req.body;
  pool.query(
    `DELETE FROM Likes WHERE idUser = ? AND idPost = ?`,
    [parseInt(idUser), parseInt(idPost)],
    (err, results) => {
      if (err) {
        console.error("Error unliking post:", err);
        return res.status(500).send("Server error");
      }
      res.status(200).send({ message: "Unliked successfully" });
    }
  );
});

app.get("/stories", (req, res) => {
  pool.query(
    `SELECT p.*, u.avatar, u.username FROM Post p
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE p.type = 'story' AND TIMESTAMPDIFF(HOUR, p.upload_at, NOW()) <= 24
     ORDER BY p.idPost DESC`,
    (err, results) => {
      if (err) {
        console.error("Error fetching stories:", err);
        return res.status(500).send("Error fetching stories");
      }
      res.status(200).json(results);
    }
  );
});

app.get("/Userstories", (req, res) => {
  pool.query(
    `SELECT u.idUser, u.avatar, u.username, MAX(p.upload_at) AS latest_upload_at FROM Post p
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE p.type = 'story' AND TIMESTAMPDIFF(HOUR, p.upload_at, NOW()) <= 24
     GROUP BY u.idUser, u.avatar, u.username
     ORDER BY latest_upload_at DESC`,
    (err, results) => {
      if (err) {
        console.error("Error fetching stories:", err);
        return res.status(500).send("Error fetching stories");
      }
      res.status(200).json(results);
    }
  );
});

app.get("/searchKeyWord", (req, res) => {
  const { keyword } = req.query;
  pool.query(
    `SELECT * FROM Post p
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE (p.content LIKE ? OR u.username LIKE ?)
     AND p.type = 'video'`,
    [`%${keyword}%`, `%${keyword}%`],
    (err, results) => {
      if (err) {
        console.error("Error fetching searchKeyword:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

app.get("/search", (req, res) => {
  pool.query(
    `SELECT * FROM Post p 
     INNER JOIN Users u ON p.idUser = u.idUser
     WHERE p.type = 'video'`,
    (err, results) => {
      if (err) {
        console.log("Error fetching search:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

app.get("/suggest", (req, res) => {
  const { id } = req.query;
  pool.query(
    `SELECT u.* FROM Users u 
     WHERE u.idUser != ? 
     AND NOT EXISTS (
       SELECT 1 
       FROM Follow f
       WHERE f.id_following = ? 
       AND f.id_followed = u.idUser
     )
     LIMIT 3`,
    [parseInt(id), parseInt(id)],
    (err, results) => {
      if (err) {
        console.log("Error fetching suggest:", err);
        return res.status(500).send("Server Error");
      }
      res.json(results);
    }
  );
});

// Khởi chạy server
app.listen("8081", () => {
  console.log("Server running on http://localhost:8081");
});
