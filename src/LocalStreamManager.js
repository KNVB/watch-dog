/**
 * Local Media Manager object
 * @date 8/18/2023 - 4:56:01 PM
 *
 */
class LocalStreamManager{
	static #templateConstraint = {
		"audio": {
			channelCount: 2,
			echoCancellation: true,
			sampleSize: 16
		},
		"video": {
			width: { min: "640", ideal: "1280", max: "1920" },
			height: { min: "480", ideal: "720", max: "1080" }
		}
	};
	/**
	 * Get client media stream
	 * @date 8/18/2023 - 1:45:00 PM
	 *
	 * @async
	 * @param {boolean} shareVideo if true include video stream in return stream, else do not.
	 * @param {boolean} shareAudio if true include audio stream in return stream, else do not.
	 * @returns {MediaStream}
	 * @static 
	 */
	static async getMediaStream(shareVideo, shareAudio) {
		let constraints = {};
		if (shareVideo) {
			constraints["video"] = this.#templateConstraint.video;
		}
		if (shareAudio) {
			constraints["audio"] = this.#templateConstraint.audio;
		}
		console.log("constraints=" + JSON.stringify(constraints));
		if (shareVideo || shareAudio) {
			return await navigator.mediaDevices.getUserMedia(constraints);
		} else {
			return null;
		}
	}
	/**
	 * Share desktop
	 * @date 8/18/2023 - 1:47:49 PM
	 *
	 * @async
	 * @param {boolean} shareVideo if true include video stream in return stream, else do not.
	 * @param {boolean} shareAudio if true include audio stream in return stream, else do not.
	 * @returns {MediaStream}
	 * @static
	 */
	static async getShareDesktopStream(shareVideo, shareAudio) {
		let localStream = null;
		if (shareVideo || shareAudio) {
			let constraints = { "audio": shareAudio, "video": shareVideo };
			localStream = await navigator.mediaDevices.getDisplayMedia(constraints);
		}
		return localStream;
	}
	/**
	 * Close a media stream
	 * @date 8/18/2023 - 1:49:09 PM
	 *
	 * @async
	 * @param {MediaStream} stream
	 * @static
	 */
	static async closeStream(stream){
		console.log("LocalStreamManager.closeStream is called.");
		if (stream) {
			stream.getTracks().forEach(async track => {
				track.stop();
			});
		}
	}
}
export default LocalStreamManager