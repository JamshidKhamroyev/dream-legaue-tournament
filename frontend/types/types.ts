import React from "react";

export interface ITournament {
    _id: string;
    title: string;
    time: string;
    location: string;
    creator: IUser;           
    status: "pending" | "started" | "finished" | string;
    players: IUser[];         
    createdAt: string;
    updatedAt: string;
    __v: number;
    matchs: string[];
}

export interface IUser {
    _id: string;
    email: string;
    password: string;
    username: string;
    avatar: string;
    createdAt: string;
    updatedAt: string;
}  

export interface ChildProps {
    children: React.ReactNode
}


export interface Player {
    _id: string;
    email: string;
}
  
export interface Match {
    _id: string;
    tournamet: string;
    round: number;
    player1: Player | null;
    player2: Player | null;
    winner: Player | null;
    nextMatchId: string | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}