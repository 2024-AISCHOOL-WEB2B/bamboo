package org.example.please.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import org.example.please.entity.Diary;
import org.example.please.service.DiaryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.please.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/diaries")
public class DiaryController {

    @Autowired
    private DiaryService diaryService;

    @Autowired
    private UserService userService;

    // application.properties에서 서버 URL을 읽어옵니다.
    @Value("${server.base.url}")
    private String serverBaseUrl;

    @GetMapping("/yesterday-and-today")
    public ResponseEntity<Map<String, List<Diary>>> getDiariesForYesterdayAndToday() {
        Map<String, List<Diary>> diaries = diaryService.getDiariesForYesterdayAndToday();
        return ResponseEntity.ok(diaries);  // 200 OK 응답
    }

    @PostMapping("/create-with-photo")
    public ResponseEntity<Diary> createDiaryWithPhoto(
            @RequestPart("diary") String diaryData,
            @RequestPart(value = "photo", required = false) List<MultipartFile> photoFiles) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        // 다중 파일을 지원하는 메서드 호출
        Diary newDiary = diaryService.createDiary(diary, photoFiles);

        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }

    @PostMapping("/upload-from-url")
    public ResponseEntity<Diary> uploadFromUrl(
            @RequestParam("diary") String diaryData,
            @RequestParam("imageUrl") String imageUrl) throws IOException {

        ObjectMapper objectMapper = new ObjectMapper();
        Diary diary = objectMapper.readValue(diaryData, Diary.class);

        Diary newDiary = diaryService.createDiaryFromUrl(diary, imageUrl);

        return ResponseEntity.status(HttpStatus.CREATED).body(newDiary);
    }

    @GetMapping("/user_diaries")
    public ResponseEntity<List<Map<String, Object>>> getDiariesByUserEmail(@RequestParam String userEmail) {
        System.out.println("Received request for userEmail: " + userEmail);

        List<Diary> diaries = diaryService.getDiariesByUserEmail(userEmail);
        System.out.println("Diaries found: " + diaries.size());

        List<Map<String, Object>> diaryWithUrls = diaries.stream().map(diary -> {
            Map<String, Object> diaryMap = new HashMap<>();
            diaryMap.put("diaryIdx", diary.getDiaryIdx());
            diaryMap.put("userEmail", diary.getUserEmail());
            diaryMap.put("diaryDate", diary.getDiaryDate());
            diaryMap.put("emotionTag", diary.getEmotionTag());
            diaryMap.put("diaryWeather", diary.getDiaryWeather());
            diaryMap.put("diaryContent", diary.getDiaryContent());
            diaryMap.put("createdAt", diary.getCreatedAt());
            try {
                diaryMap.put("diaryPhoto", diaryService.createImageUrls(diary.getDiaryPhoto()));
            } catch (IOException e) {
                e.printStackTrace();
                diaryMap.put("diaryPhoto", "Error parsing image URLs");
            }
            return diaryMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(diaryWithUrls);
    }

    // diaryPhoto URL 생성 메서드
    private String createImageUrl(String diaryPhoto) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            List<String> photoList = objectMapper.readValue(diaryPhoto, new TypeReference<List<String>>() {});

            return photoList.stream()
                    .map(photo -> serverBaseUrl + "/uploads/images/db/" + photo) // 공통 서버 URL 사용
                    .collect(Collectors.joining(","));
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }

    @GetMapping("/month")
    public List<Diary> getMonthDiaries(
            @RequestParam String userEmail,
            @RequestParam int year,
            @RequestParam int month) {
        return diaryService.getDiariesByMonth(userEmail, year, month);
    }
}
