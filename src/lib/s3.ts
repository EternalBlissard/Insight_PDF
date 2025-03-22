import AWS from 'aws-sdk';
export async function uploadToS3(file: File) {
    try{
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_S3_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
        const s3 = new AWS.S3({
            params: {
                Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            },
            region: process.env.AWS_REGION,
        });

        const file_key = 'upload/'+Date.now().toString()+'/'+file.name.replace(' ', '-');
        const params = {
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME!,
            Key: file_key,
            Body: file,
        };

        const upload = s3.putObject(params).on('httpUploadProgress', (event)=>{
            console.log('uploading to s3...', parseInt((event.loaded*100/event.total).toString())+'% done');
        }).promise();

        await upload.then(data => {
            console.log('upload successful to S3', file_key, data);
        }).catch(error => {
            console.error('upload failed', error);
        });

        return Promise.resolve({
            file_key,
            file_name: file.name,
        });
    }
    catch(error){
        console.error(error);
    }
}


export async function getS3FileUrl(file_key: string){
    const url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file_key}`;
    return url;
}
