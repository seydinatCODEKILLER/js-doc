import { AbstractClientModal } from "./AbstractClientModal.js";

export class ClientEditModal extends AbstractClientModal {
  constructor(app, client) {
    super(app, {
      title: "Modifier le client",
      client,
    });
    this.client = client;
  }

  initForm() {
    if (!this.client) return;

    this.form.querySelector('[name="nom"]').value = this.client.nom || "";
    this.form.querySelector('[name="prenom"]').value = this.client.prenom || "";

    const hasAccountToggle = this.form.querySelector('[name="has_account"]');
    hasAccountToggle.checked = this.client.has_account;

    if (this.client.has_account) {
      document.querySelectorAll(".account-field").forEach((field) => {
        field.classList.remove("hidden");
      });
      this.form.querySelector('[name="email"]').value = this.client.email || "";
    }

    if (this.client.telephone?.startsWith("+221")) {
      this.form.querySelector('[name="telephone"]').value =
        this.client.telephone.substring(4);
    } else if (this.client.telephone) {
      this.form.querySelector('[name="telephone"]').value =
        this.client.telephone;
    }

    // Gestion de l'avatar
    if (this.client.avatar) {
      const preview = this.form.querySelector("#avatar-preview");
      const previewContainer = this.form.querySelector(".avatar-preview");
      preview.src = this.client.avatar;
      previewContainer.classList.remove("hidden");
    }
  }

  getSubmitButtonText() {
    return "Mettre à jour";
  }

  getLoadingText() {
    return "Mise à jour...";
  }

  async processFormData(formData) {
    try {
        const updateData = {
           id_client: this.client.id_client,
          nom: formData.nom,
          prenom: formData.prenom,
          telephone: formData.telephone,
          avatar: formData.avatar,
          has_account: formData.has_account,
          id_boutiquier: this.app.store.state.user.id,
          has_account: formData.has_account
        };

      if (formData.has_account) {
        updateData.email = formData.email;
        if (formData.password && formData.password.trim() !== "") {
          updateData.password = formData.password;
        }
      } else {
        updateData.email = "";
        updateData.password = "";
      }

      await this.controller.updateClient(this.client.id, updateData);
      this.app.eventBus.publish("client:updated");
    } catch (error) {
      throw error;
    }
  }
}
