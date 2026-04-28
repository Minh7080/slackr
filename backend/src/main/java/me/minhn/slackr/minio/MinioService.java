package me.minhn.slackr.minio;

import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.minhn.slackr.exception.ServerException;
import me.minhn.slackr.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Date;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;
    private final JwtUtil jwtUtil;
    private MinioClient presignClient;

    @PostConstruct
    public void initBucket() {
        presignClient = MinioClient.builder()
                .endpoint(minioConfig.getPublicUrl())
                .credentials(minioConfig.getAccessKey(), minioConfig.getSecretKey())
                .region("us-east-1")
                .build();
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioConfig.getBucketName()).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioConfig.getBucketName()).build()
                );
                log.info("Bucket created: {}", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.error("Error initializing bucket", e);
            throw new RuntimeException("Could not initialize bucket", e);
        }
    }

    public String uploadFile(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .stream(file.getInputStream(), file.getSize(), (long) -1)
                            .contentType(file.getContentType())
                            .build()
            );
            return fileName;
        } catch (Exception e) {
            throw new ServerException();
        }
    }

    public InputStream downloadFile(String fileName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            throw new ServerException();
        }
    }

    public void deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .build()
            );
        } catch (Exception e) {
            throw new ServerException();
        }
    }

    public String getPresignedUrl(String fileName) {
        if (fileName == null || fileName.isBlank()) return null;
        Date expDate = jwtUtil.getCurrentTokenExpiration();
        int expirySeconds = expDate != null
                ? (int) Math.max(60, (expDate.getTime() - System.currentTimeMillis()) / 1000)
                : (int) TimeUnit.DAYS.toSeconds(7);
        try {
            return presignClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Http.Method.GET)
                            .bucket(minioConfig.getBucketName())
                            .object(fileName)
                            .expiry(expirySeconds, TimeUnit.SECONDS)
                            .build()
            );
        } catch (Exception e) {
            throw new ServerException();
        }
    }
}
