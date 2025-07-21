import { db } from './firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { Task } from '@/types';

export class FirestoreService {
  // Listen to real-time task updates
  static listenToUserTasks(userId: number, callback: (tasks: Task[]) => void) {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef, 
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      
      callback(tasks);
    });
  }

  // Sync task to Firestore when created/updated
  static async syncTaskToFirestore(task: Task) {
    try {
      const tasksRef = collection(db, 'tasks');
      await addDoc(tasksRef, {
        ...task,
        firestore_synced_at: new Date()
      });
    } catch (error) {
      console.error('Error syncing to Firestore:', error);
    }
  }

  // Update task in Firestore
  static async updateTaskInFirestore(taskId: string, updates: Partial<Task>) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        firestore_updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  }

  // Delete task from Firestore
  static async deleteTaskFromFirestore(taskId: string) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Error deleting from Firestore:', error);
    }
  }
}