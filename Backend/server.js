import express from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}).promise();

const corsConf = {
  origin: "*",
  methods: ["POST", "GET", "DELETE"],
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cors(corsConf));



app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [userRows] = await pool.query(
      `SELECT user_id, user_handle, pssword FROM users WHERE email_adress = ?`, 
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = userRows[0];

    // PASO 2 Verificar contraseña
    if (user.pssword !== password) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    //PASO 3 generar token para iniciar la sesion creandolo con el id y con el nombre de user
    const accessToken = jwt.sign(
      { 
        userId: user.user_id,
        handle: user.user_handle 
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1h' // El token expira en 1 hora
      }   
    );


    // PASO 4 Si todo es correcto, responder con éxito
    res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        handle: user.user_handle
      },
      token: accessToken // Esto es el token mandado en la respuesta
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { user, email, password, firstName, secondName, phoneNumber } = req.body;
   
    // Verificar si el email ya existe
    const [emailExists] = await pool.query(
      "SELECT user_id FROM users WHERE email_adress = ?", 
      [email]
    );
    
    if (emailExists.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Verificar si el usuario ya existe
    const [userExists] = await pool.query(
      "SELECT user_id FROM users WHERE user_handle = ?", 
      [user]
    );
    
    if (userExists.length > 0) {
      return res.status(400).json({ error: "El nombre de usuario ya existe" });
    }

    // Verificar si el telefono ya existe
    const [phoneNumberExists] = await pool.query(
      "SELECT user_id FROM users WHERE phoneNumber = ?", 
      [phoneNumber]
    );

    if (phoneNumberExists.length > 0) {
      return res.status(400).json({ error: "El telefono ya existe" });
    }

    
    

    // Insertar nuevo usuario
    const [result] = await pool.query(
      `INSERT INTO users 
        (user_handle, email_adress, pssword, first_name, last_name, phonenumber) 
        VALUES (?, ?, ?, ?, ?, ?)`,
      [user, email.toLowerCase(), password, firstName, secondName, phoneNumber]
    );

    res.status(201).json({
      success: true,
      user: {
        id: result.insertId,
        handle: user
      }
    }); 

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error del servidor" });
  }
});


app.post("/Rutina", async (req, res) => {
  try {
    const { owner, routine_name, exercises } = req.body;
    const [result] = await pool.query(
      `INSERT INTO routines (owner_id, routine_name) VALUES (?, ?)`,
      [owner, routine_name]
    );
    const routineId = result.insertId;

    // Inserción masiva en routine_exercises
    const values = exercises.map((exerciseId) => [routineId, exerciseId]);
    await pool.query(
      `INSERT INTO routine_exercises (routine_id, exercise_id) VALUES ?`,
      [values]
    );

    return res.status(201).json({ 
      success: true, 
      routineId 
    });
  } catch (error) {
    console.error("Error al añadir rutina", error);
    return res.status(500).json({ success: false, error: "Error del servidor" });
  }
});


app.get("/Rutina/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [rutinas] = await pool.query(
      `SELECT routine_id, routine_name, created_at 
       FROM routines 
       WHERE owner_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      rutinas: rutinas
    });

  } catch (error) {
    console.error("Error al obtener rutinas:", error);
    res.status(500).json({ success: false, error: "Error del servidor" });
  }
});

app.get("/Rutina/:routineId/exercises", async (req, res) => {
  try {
    const routineId = req.params.routineId;

    // Ejecuta la consulta
    const [rows] = await pool.query(
      `SELECT exercise_id
         FROM routine_exercises
         WHERE routine_id = ?`,
      [routineId]
    );

    // rows es un array de objetos { exercise_id: <n> }
    const exercises = rows.map(row => String(row.exercise_id));

    return res.json({ success: true, exercises });
  } catch (error) {
    console.error("Error al obtener ejercicios de rutina:", error);
    return res.status(500).json({ success: false, error: "Error del servidor" });
  }
});

app.delete("/Rutina/:routineId", async (req, res) => {
  const routineId = req.params.routineId;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Eliminar relaciones en routine_exercises
    await conn.query(
      `DELETE FROM routine_exercises WHERE routine_id = ?`,
      [routineId]
    );

    // 2) Eliminar la rutina
    const [result] = await conn.query(
      `DELETE FROM routines WHERE routine_id = ?`,
      [routineId]
    );

    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Rutina no encontrada" });
    }
    return res.json({ success: true });
  } catch (error) {
    await conn.rollback();
    console.error("Error al eliminar rutina:", error);
    return res.status(500).json({ success: false, error: "Error del servidor" });
  } finally {
    conn.release();
  }
});



app.listen(3000, () => {
  console.log("server running on port 3000");
})


