import { uploadFile } from '@/api/file'

export default class ImageUpload {
  loader
  constructor(loader) {
    this.loader = loader
  }
  upload() {
    return this.loader.file.then(
      file =>
        new Promise((resolve, reject) => {
          // eslint-disable-next-line promise/no-nesting
          uploadFile(file).then((res) => {
			resolve({
				default: import.meta.env.VITE_EDITOR_IMAGE_URL + '/file/' + res.file_guid
			})
		  })
		  .catch(message => {
            console.log(message, 'error')
          })
        }),
    )
  }
}
