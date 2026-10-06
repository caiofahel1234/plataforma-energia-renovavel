FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/energia_renovavel?schema=public"

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]