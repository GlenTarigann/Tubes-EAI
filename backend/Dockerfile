# Menggunakan image Node.js yang ringan untuk efisiensi memori
FROM node:18-alpine

# Menentukan direktori operasional di dalam container
WORKDIR /usr/src/app

# Menyalin definisi dependensi terlebih dahulu (optimasi cache Docker)
COPY package*.json ./

# Mengeksekusi instalasi dependensi
RUN npm install

# Menyalin seluruh kode sumber backend
COPY . .

# Membuka port komunikasi (Port mapping akan diatur di docker-compose nanti)
EXPOSE 4000

# Titik masuk eksekusi aplikasi
CMD ["npm", "start"]