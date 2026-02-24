const userModel = require("../models/user.model");

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    if (users.length === 0) {
      throw new Error("No users found");
    }
    res
      .status(200)
      .json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    res
      .status(200)
      .json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new userModel({ name, email, password });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUserAdmin = async (req, res) => {
  try {
    const { name, email, password, tel } = req.body;
    const newUser = new userModel({
      name,
      email,
      password,
      tel,
      role: "admin",
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUserFormateur = async (req, res) => {
  try {
    const { name, email, password, tel } = req.body;
    const newUser = new userModel({
      name,
      email,
      password,
      tel,
      role: "formateur",
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.createUserApprenant = async (req, res) => {
  try {
    const { name, email, password, tel } = req.body;
    const newUser = new userModel({
      name,
      email,
      password,
      tel,
      role: "apprenant",
    });
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, age, location } = req.body;
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, age, location },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found");
    }
    res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      throw new Error("User not found");
    }
    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
