export interface User {
	email: string;
	first_name: string;
	id: number;
	last_name: string;
	password: string;
	password_confirmation: string;
}

export interface UserTask {
	task_id: number;
	user_id: number;
}
