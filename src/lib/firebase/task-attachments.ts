import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, doc, addDoc, deleteDoc, getDocs, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { storage, db } from './config';
import { TaskAttachment } from '../types';
import { logActivity } from './tasks';

export const getAttachmentsRef = (userId: string, taskId: string) => 
  collection(db, `users/${userId}/tasks/${taskId}/attachments`);

export const uploadAttachment = async (userId: string, taskId: string, file: File): Promise<TaskAttachment> => {
  const storagePath = `users/${userId}/tasks/${taskId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);

  const attachmentsRef = getAttachmentsRef(userId, taskId);
  const docRef = await addDoc(attachmentsRef, {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    storagePath,
    downloadUrl,
    createdAt: serverTimestamp()
  });

  // Update task indicator
  const taskRef = doc(db, `users/${userId}/tasks`, taskId);
  await updateDoc(taskRef, {
    hasAttachments: true,
    updatedAt: serverTimestamp()
  });

  await logActivity(userId, taskId, 'attachment_added', { fileName: file.name });

  return {
    id: docRef.id,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    storagePath,
    downloadUrl,
    createdAt: new Date() as any
  };
};

export const deleteAttachment = async (userId: string, taskId: string, attachmentId: string): Promise<void> => {
  const docRef = doc(db, `users/${userId}/tasks/${taskId}/attachments`, attachmentId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;
  const attachment = snap.data() as TaskAttachment;

  // Delete from Storage
  const storageRef = ref(storage, attachment.storagePath);
  await deleteObject(storageRef);

  // Delete from Firestore
  await deleteDoc(docRef);

  // Update task indicator if no more attachments
  const attachmentsRef = getAttachmentsRef(userId, taskId);
  const remaining = await getDocs(attachmentsRef);
  if (remaining.empty) {
    const taskRef = doc(db, `users/${userId}/tasks`, taskId);
    await updateDoc(taskRef, {
      hasAttachments: false,
      updatedAt: serverTimestamp()
    });
  }
};

export const getAttachmentsByTask = async (userId: string, taskId: string): Promise<TaskAttachment[]> => {
  const snapshot = await getDocs(getAttachmentsRef(userId, taskId));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskAttachment));
};
