export interface Task {
	description: string;
	id: number;
	priority: number;
	status: TaskStatus;
	title: string;
}

type TaskStatus = 'done' | 'in progress';
