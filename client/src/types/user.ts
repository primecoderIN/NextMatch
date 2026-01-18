export type User = {
    id: string,
    userName: string,
    token: string,
    email: string ,
    imageUrl?: string
}

export type LoginCredentials = {
    email: string,
    password: string
}

export type RegisterCredentials = {
    userName: string,
    email: string,
    password: string
}