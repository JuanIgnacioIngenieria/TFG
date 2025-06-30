import cv2
import mediapipe as mp

# Inicializa MediaPipe Pose y utilidades de dibujo
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Rutas de input y output
video_path = "C:\\Users\\n4cho\\OneDrive\\Documentos\\AppReactNode\\GlowUp\\assets\\videos\\video.MOV"
output_path = "C:\\Users\\n4cho\\OneDrive\\Documentos\\AppReactNode\\GlowUp\\assets\\videos\\video_nuevo.MP4"


# Intenta abrir el video
Video = cv2.VideoCapture(video_path)
if not Video.isOpened():
    print("Error: No se pudo abrir el video.")
    exit()

# Lee propiedades originales
orig_width  = int(Video.get(cv2.CAP_PROP_FRAME_WIDTH))
orig_height = int(Video.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps         = Video.get(cv2.CAP_PROP_FPS)

# ===== Ajusta este valor =====
# 1.0 = tamaño original
# 0.5 = mitad de ancho y alto
# 0.75 = 75% de tamaño, etc.
scale = 0.25
# =============================

width  = int(orig_width  * scale)
height = int(orig_height * scale)

# Define el codec y crea el VideoWriter
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # para .MP4
writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

# Inicializa el modelo Pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1)

# Define los landmarks a visualizar
landmarks = {
    "RIGHT_WRIST":      mp_pose.PoseLandmark.RIGHT_WRIST,
    "RIGHT_ELBOW":      mp_pose.PoseLandmark.RIGHT_ELBOW,
    "RIGHT_SHOULDER":   mp_pose.PoseLandmark.RIGHT_SHOULDER,
    "LEFT_WRIST":       mp_pose.PoseLandmark.LEFT_WRIST,
    "LEFT_ELBOW":       mp_pose.PoseLandmark.LEFT_ELBOW,
    "LEFT_SHOULDER":    mp_pose.PoseLandmark.LEFT_SHOULDER,
    "RIGHT_HIP":        mp_pose.PoseLandmark.RIGHT_HIP,
    "LEFT_HIP":         mp_pose.PoseLandmark.LEFT_HIP,
    "RIGHT_KNEE":       mp_pose.PoseLandmark.RIGHT_KNEE,
    "LEFT_KNEE":        mp_pose.PoseLandmark.LEFT_KNEE,
    "RIGHT_ANKLE":      mp_pose.PoseLandmark.RIGHT_ANKLE,
    "LEFT_ANKLE":       mp_pose.PoseLandmark.LEFT_ANKLE,
    "RIGHT_HEEL":       mp_pose.PoseLandmark.RIGHT_HEEL,
    "LEFT_HEEL":        mp_pose.PoseLandmark.LEFT_HEEL,
    "RIGHT_FOOT_INDEX": mp_pose.PoseLandmark.RIGHT_FOOT_INDEX,
    "LEFT_FOOT_INDEX":  mp_pose.PoseLandmark.LEFT_FOOT_INDEX,
}

# Define las conexiones entre puntos
connections = [
    ("RIGHT_SHOULDER", "RIGHT_ELBOW"),
    ("RIGHT_ELBOW",    "RIGHT_WRIST"),
    ("LEFT_SHOULDER",  "LEFT_ELBOW"),
    ("LEFT_ELBOW",     "LEFT_WRIST"),
    ("RIGHT_SHOULDER", "RIGHT_HIP"),
    ("LEFT_SHOULDER",  "LEFT_HIP"),
    ("RIGHT_HIP",      "RIGHT_KNEE"),
    ("RIGHT_KNEE",     "RIGHT_ANKLE"),
    ("LEFT_HIP",       "LEFT_KNEE"),
    ("LEFT_KNEE",      "LEFT_ANKLE"),
    ("RIGHT_ANKLE",    "RIGHT_HEEL"),
    ("LEFT_ANKLE",     "LEFT_HEEL"),
    ("RIGHT_HEEL",     "RIGHT_FOOT_INDEX"),
    ("LEFT_HEEL",      "LEFT_FOOT_INDEX"),
    ("LEFT_SHOULDER",  "RIGHT_SHOULDER"),
    ("LEFT_HIP",       "RIGHT_HIP"),
]

# Umbral mínimo de visibilidad para dibujar
VIS_THRESHOLD = 0.7

while True:
    ret, frame = Video.read()
    if not ret:
        break

    # Redimensiona manteniendo la proporción
    frame_resized = cv2.resize(frame, (width, height))
    rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb)

    if results.pose_landmarks:
        # Dibuja conexiones si ambos puntos son suficientemente visibles
        for p1, p2 in connections:
            lm1 = results.pose_landmarks.landmark[landmarks[p1]]
            lm2 = results.pose_landmarks.landmark[landmarks[p2]]
            if lm1.visibility > VIS_THRESHOLD and lm2.visibility > VIS_THRESHOLD:
                x1 = int(lm1.x * width)
                y1 = int(lm1.y * height)
                x2 = int(lm2.x * width)
                y2 = int(lm2.y * height)
                cv2.line(frame_resized, (x1, y1), (x2, y2), (255, 255, 255), 2)

        # Dibuja círculos en cada landmark visible
        for name, idx in landmarks.items():
            lm = results.pose_landmarks.landmark[idx]
            if lm.visibility > VIS_THRESHOLD:
                x = int(lm.x * width)
                y = int(lm.y * height)
                # Borde blanco
                cv2.circle(frame_resized, (x, y), 6, (255, 255, 255), 2)
                # Relleno pastel
                cv2.circle(frame_resized, (x, y), 5, (60, 157, 252), -1)

    # Escribe el frame procesado en el vídeo de salida
    writer.write(frame_resized)

    # Muestra en pantalla (opcional)
    cv2.imshow("Pose Detection", frame_resized)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Libera recursos
Video.release()
writer.release()
cv2.destroyAllWindows()

print(f"Vídeo guardado en: {output_path}")
