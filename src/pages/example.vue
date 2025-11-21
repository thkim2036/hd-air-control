<script setup>
import notify from '@hiway/utils/notify'
import { getEmpInfo, setFileUpload, getEncrypt, getDecrypt, setApproval } from '@/api/example'
import { nextTick, ref, onMounted, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { fitHeightOfElement } from '@/utils/useSizeUtils'

defineOptions({
  name: 'example',
})
const { t } = useI18n()

////////////////////////////////////////////////////////////////
// 데이터 조회 예제 (get 방식 전송)
const emplid = ref('')
const empInfo = ref({})
const textEmpInfo = ref('')

const onGetEmpinfo = () => {
  getEmpInfo(emplid.value).then(res => {
    empInfo.value = res
    textEmpInfo.value = empInfo.value.hname + " " + empInfo.value.jnm + "\r\n"
                     + empInfo.value.dept_nm + " " + empInfo.value.nsosog_nm + " " + " " + empInfo.value.hnd_phn;
  })
}
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// 파일 업로드 예제 (post multipart 전송)
const fileInput = ref(null);
let fileIndex = 0;

const fileData = ref([]);
const vm = getCurrentInstance().proxy

const onAttachFile = () => {
  fileInput.value.click();
}

// 파일 선택 시 처리할 함수
const handleFileChange = async (event) => {
  vm.$swal({
    title: t("xbuilder.msg.question-save"),
    showCancelButton: true,
  }).then(res => {
    if(res.isConfirmed) {
      for(var i = 0 ; i < event.target.files.length ; i++){
        var selectedFile = event.target.files[i];
        if (selectedFile) {
          fileData.value.push({ file_index: fileIndex++, fileData: selectedFile, file_nm: selectedFile.name})
        }
      }
      
      const formFileData = new FormData();
      fileData.value.forEach((fileObj) => {
        formFileData.append("arrFileInfo", fileObj.fileData);
      });

      setFileUpload(formFileData).then(res => {
        console.log(JSON.stringify(res))
        if(res.body === true){
          notify.success("업로드 성공");
        }else{
          notify.err("업로드 실패");
        }
      })
    }
  })
  
  // 입력 파일 초기화
  if(fileInput.value != null){
    fileInput.value.value = null;
  }
  fileData.value = [];
};
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// 암복호화 예제 (post 방식 전송)

const encryText = ref('')
const encryResult = ref('')
const decryText = ref('')
const decryResult = ref('')

const onEncrypt = () => {
  getEncrypt(encryText.value).then(res => {
    console.log(res);
    encryResult.value = res.body
  })
}
const onDecrypt = () => {
  getDecrypt(decryText.value).then(res => {
    decryResult.value = res.body
  })
}

/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// 통합결재 (HD Office)

const onApproval = () => {
  setApproval().then(res => {
    if(res.body === true){
      notify.success("업로드 성공");
    }else{
      notify.err("업로드 실패");
    }
  })
}
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// PDF 뷰어

const frameHeight = ref(500)
const frame = ref(null)
const pdfIframeSrc = ref('')
const serverProxy = import.meta.env.VITE_SYSTEM_CONTEXT

onMounted(() => {
  frameHeight.value = fitHeightOfElement(frame.value, 300, 0)

  // 컴포넌트가 완전히 렌더링된 후 src 설정
  nextTick(() => {
    pdfIframeSrc.value = '/external/pdfjs/web/viewer.html?file=' + serverProxy + '/projectExample/getHdxExamplePdf'
  })
})
</script>

<template>  
  <v-container>
    <!-- Call to Action -->
    <v-row class="mt-12">
      <v-col cols="2" class="text-center">
        <VTextField
          v-model="emplid"
          type="string"
          label="사번입력"
          style="border-radius: 0px; height: 56px;"
          class="pt-2 pb-5"
        />
        <v-btn
          class="mt-3"
          color="primary"
          large
          @click="onGetEmpinfo"
        >
          인사정보 Get
        </v-btn>
      </v-col>
      <v-col cols="4" class="text-center">
        <v-textarea
          v-model="textEmpInfo"
          clearable
          dense
          type="text"
          readonly
        >
        </v-textarea>
      </v-col>
      <v-col cols="2" class="text-center">
        <v-btn
          class="mt-3"
          color="primary"
          large
          @click="onAttachFile"
        >
          파일 UPLOAD
        </v-btn>
        <!-- 파일 입력 요소 (숨겨짐) -->
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          @change="handleFileChange"
          multiple
        />
      </v-col>
      <v-col cols="2" class="text-center">
        <v-btn
          class="mt-3"
          color="primary"
          large
          @click="onApproval"
        >
          통합 결재
        </v-btn>
      </v-col>
    </v-row>

    <!-- Call to Action -->
    <v-row class="mt-12">
      <v-col cols="1" class="text-center">
        <v-btn
          class="mt-3"
          color="primary"
          large
          @click="onEncrypt"
        >
          암호화
        </v-btn>
      </v-col>
      <v-col cols="2" class="text-center">
        <VTextField
          v-model="encryText"
          type="string"
          label="암호화"
          style="border-radius: 0px; height: 56px;"
          class="pt-1"
        />
        <VTextField
          v-model="encryResult"
          type="string"
          label="결과"
          readonly
          style="border-radius: 0px; height: 56px;"
          class="pt-4"
        />
      </v-col>
      <v-col cols="1" class="text-center">
        <v-btn
          class="mt-3"
          color="primary"
          large
          @click="onDecrypt"
        >
          복호화
        </v-btn>
      </v-col>
      <v-col cols="2" class="text-center">
        <VTextField
          v-model="decryText"
          type="string"
          label="복호화"
          style="border-radius: 0px; height: 56px;"
          class="pt-1"
        />
        <VTextField
          v-model="decryResult"
          type="string"
          label="결과"
          readonly
          style="border-radius: 0px; height: 56px;"
          class="pt-4"
        />
      </v-col>
    </v-row>

    <v-row class="mt-12">
      <iframe
        ref="frame"
        :src="pdfIframeSrc"
        width="100%"
        :height="frameHeight"
        style="border: 1px solid #e1e1e1"
      />
    </v-row>
  </v-container>  
</template>

<route lang="yaml">
meta:    
  noAuth: true
</route>
