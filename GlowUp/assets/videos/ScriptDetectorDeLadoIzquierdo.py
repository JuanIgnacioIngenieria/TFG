import cv2
import mediapipe as mp

# Inicializa MediaPipe Pose y utilidades de dibujo
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

# Rutas de input y output
video_path  = "C:\\Users\\n4cho\\OneDrive\\Documentos\\AppReactNode\\GlowUp\\assets\\videos\\video.MOV"
output_path = "C:\\Users\\n4cho\\OneDrive\\Documentos\\AppReactNode\\GlowUp\\assets\\videos\\video_nuevo_left.MP4"

# Intenta abrir el video
Video = cv2.VideoCapture(video_path)
if not Video.isOpened():
    print("Error: No se pudo abrir el video.")
    exit()

# Lee propiedades originales
orig_width  = int(Video.get(cv2.CAP_PROP_FRAME_WIDTH))
orig_height = int(Video.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps         = Video.get(cv2.CAP_PROP_FPS)

# Ajusta este valor de escala si quieres otro tamaño (1.0 = original, 0.5 = mitad, etc.)
scale = 0.25
width  = int(orig_width  * scale)
height = int(orig_height * scale)

# Define el codec y crea el VideoWriter
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

# Inicializa el modelo Pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=1)

# Umbral mínimo de visibilidad para dibujar
VIS_THRESHOLD = 0.4

# Puntos del lado izquierdo a visualizar
landmarks_left = {
    "LEFT_WRIST":      mp_pose.PoseLandmark.LEFT_WRIST,
    "LEFT_ELBOW":      mp_pose.PoseLandmark.LEFT_ELBOW,
    "LEFT_SHOULDER":   mp_pose.PoseLandmark.LEFT_SHOULDER,
    "LEFT_HIP":        mp_pose.PoseLandmark.LEFT_HIP,
    "LEFT_KNEE":       mp_pose.PoseLandmark.LEFT_KNEE,
    "LEFT_ANKLE":      mp_pose.PoseLandmark.LEFT_ANKLE,
    "LEFT_HEEL":       mp_pose.PoseLandmark.LEFT_HEEL,
    "LEFT_FOOT_INDEX": mp_pose.PoseLandmark.LEFT_FOOT_INDEX,
}

# Conexiones del lado izquierdo
connections_left = [
    ("LEFT_SHOULDER",  "LEFT_ELBOW"),
    ("LEFT_ELBOW",     "LEFT_WRIST"),
    ("LEFT_SHOULDER",  "LEFT_HIP"),
    ("LEFT_HIP",       "LEFT_KNEE"),
    ("LEFT_KNEE",      "LEFT_ANKLE"),
    ("LEFT_ANKLE",     "LEFT_HEEL"),
    ("LEFT_HEEL",      "LEFT_FOOT_INDEX"),
    ("LEFT_ANKLE",     "LEFT_FOOT_INDEX"),
]

while True:
    ret, frame = Video.read()
    if not ret:
        break

    # Redimensiona manteniendo la proporción original
    frame_resized = cv2.resize(frame, (width, height))
    rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb)

    if results.pose_landmarks:
        # Dibuja conexiones del lado izquierdo si ambos puntos son visibles
        for p1, p2 in connections_left:
            lm1 = results.pose_landmarks.landmark[landmarks_left[p1]]
            lm2 = results.pose_landmarks.landmark[landmarks_left[p2]]
            if lm1.visibility > VIS_THRESHOLD and lm2.visibility > VIS_THRESHOLD:
                x1 = int(lm1.x * width)
                y1 = int(lm1.y * height)
                x2 = int(lm2.x * width)
                y2 = int(lm2.y * height)
                cv2.line(frame_resized, (x1, y1), (x2, y2), (255, 255, 255), 2)

        # Dibuja círculos en cada landmark visible del lado izquierdo
        for name, idx in landmarks_left.items():
            lm = results.pose_landmarks.landmark[idx]
            if lm.visibility > VIS_THRESHOLD:
                x = int(lm.x * width)
                y = int(lm.y * height)
                cv2.circle(frame_resized, (x, y), 6, (255, 255, 255), 2)   # Borde blanco
                cv2.circle(frame_resized, (x, y), 5, (60, 157, 252), -1)  # Relleno pastel

    # Escribe el frame procesado en el archivo de salida
    writer.write(frame_resized)

    # Muestra en pantalla (opcional)
    cv2.imshow("Pose Detection Left Side", frame_resized)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Libera recursos
Video.release()
writer.release()
cv2.destroyAllWindows()

print(f"Vídeo guardado en: {output_path}")
