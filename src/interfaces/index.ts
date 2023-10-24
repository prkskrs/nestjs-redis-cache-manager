import { Request as ExpressRequest } from 'express';
import { User } from 'src/users/users.schema';

export interface SignUpInterface {
    token: string;
    message?: string;
}

export interface LoginInterface {
    data?: object;
    token: string;
    message?: string;
}

// auth
export interface AuthResponse{
    message: string,
    data?:object
}

export interface CustomRequest extends ExpressRequest {
    user: User; // Adjust 'any' to the actual type of the user object if known
  }

// statuses
export interface StatusResponse {
    data?: object;
    message?: string;
}

// priorities
export interface PriorityResponse {
    data?: object;
    message?: string;
}

// projects
export interface ProjectResponse{
    data?: object;
    message?: string
}

// tasks
export interface TaskResponse{
    data?: object;
    message?: string
}

// subtasks
export interface SubTaskResponse{
    data?: object;
    message?: string
}

// projectCollaborator
export interface ProjectCollaboratorResponse{
    data?: object;
    message?: string
}

// taskCollaborator
export interface TaskCollaboratorResponse{
    data?: object;
    message?: string
}

// subTaskCollaborator
export interface SubTaskCollaboratorResponse{
    data?: object;
    message?: string
}