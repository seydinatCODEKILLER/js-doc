export class Cloudinary {
  constructor(app) {
    this.app = app;
    this.cloudName = app.config.cloudinary.cloudName;
    this.uploadPreset = app.config.cloudinary.uploadPreset;
    this.apiKey = app.config.cloudinary.apiKey;
  }

  async uploadImage(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", this.uploadPreset);
    formData.append("api_key", this.apiKey);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {throw new Error("Échec de l'upload vers Cloudinary");}

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error("Erreur Cloudinary:", error);
      this.app.services.notifications.show(
        "Échec de l'upload de l'image",
        "error"
      );
      return null;
    }
  }

  async deleteImage(publicId) {
    if (!publicId) return;

    try {
      const timestamp = Date.now();
      const signature = await this.generateSignature(publicId, timestamp);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: publicId,
            signature: signature,
            api_key: this.apiKey,
            timestamp: timestamp,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Échec de la suppression sur Cloudinary");
      }
    } catch (error) {
      console.error("Erreur suppression Cloudinary:", error);
    }
  }

  async generateSignature(publicId, timestamp) {
    // Implémentez la génération de signature si nécessaire
    // (nécessite votre secret Cloudinary)
    return ""; // À adapter selon votre configuration
  }
}
