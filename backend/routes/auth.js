const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/register", async (req, res) => {
try {
const user = new User(req.body);

```
await user.save();

res.json({
  message: "User registered"
});
```

} catch (error) {
res.status(500).json({
error: error.message
});
}
});

router.post("/login", async (req, res) => {
try {
const user = await User.findOne({
username: req.body.username,
password: req.body.password
});

```
if (!user) {
  return res.status(401).json({
    message: "Invalid credentials"
  });
}

res.json({
  message: "Login successful"
});
```

} catch (error) {
res.status(500).json({
error: error.message
});
}
});

module.exports = router;
