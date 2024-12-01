import { getDownloadURL, uploadBytesResumable } from 'firebase/storage';

const uploadFile = (storageRef, file) => {
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file); // Start the upload task

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Monitor the upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        // Handle upload errors
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        // Handle successful uploads
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); // Get the download URL
          console.log('File available at', downloadURL);
          resolve(downloadURL); // Resolve the promise with the download URL
        } catch (error) {
          reject(error); // Reject the promise if there's an error
        }
      }
    );
  });
};

export { uploadFile };
