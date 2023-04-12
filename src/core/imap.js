import imap from "imap-simple";
import { getIMAPConfig } from "./emailHelpers";

export default class Imap {
  static async connect({ mailbox, fetchOptions }) {
    const instance = new Imap();
    instance.connection = await imap.connect({ imap: getIMAPConfig(mailbox) });
    instance.provider = mailbox.provider;
    instance.fetchOptions = fetchOptions;
    return instance;
  }

  openFolder(folderPath) {
    return this.connection.openBox(folderPath);
  }

  async closeImap() {
    return await this.connection.closeBox();
  }

  endImap() {
    return this.connection.end();
  }

  search(searchCriteria, fetchOptions = this.fetchOptions) {
    return this.connection.search(searchCriteria, fetchOptions);
  }

  async moveToInbox(uid) {
    const inboxFolderPath = (await this.getInboxFolder()).path;
    return this.connection.moveMessage(uid, inboxFolderPath);
  }

  async getUID(messageId, folderPath) {
    folderPath = folderPath || (await this.getInboxFolder())?.path;
    await this.openFolder(folderPath);
    const emails = await this.search([["HEADER", "Message-ID", messageId]]);
    if (emails.length !== 0) {
      return emails[0].attributes.uid;
    }
    return null;
  }

  markAsImportant(uid) {
    switch (this.provider) {
      case "google":
        return this.connection.addMessageLabel(uid, "\\Important");
      case "zoho":
        return this.connection.addFlags(uid, "\\Flagged");
      default:
    }
  }

  async markAsStarred(uid) {
    switch (this.provider) {
      case "google":
        await this.connection.addFlags(uid, "\\Flagged");
        return this.connection.addMessageLabel(uid, "\\Starred");
      default:
    }
  }

  async getInboxFolder() {
    if (!this.folders) {
      await this.getFolders();
    }
    if (this.inboxFolder) {
      return this.inboxFolder;
    }
    for (const label of ["inbox", "all mail"]) {
      const inboxFolder = this.folders.find(
        (item) => item.label.toLowerCase() === label
      );
      if (inboxFolder) {
        this.inboxFolder = inboxFolder;
        return inboxFolder;
      }
    }
    return null;
  }

  async getPriboxFolder() {
    if (!this.folders) {
      await this.getFolders();
    }
    if (this.priboxFolder) {
      return this.priboxFolder;
    }
    for (const label of ["pribox"]) {
      const priboxFolder = this.folders.find(
        (item) => item.label.toLowerCase() === label
      );
      if (priboxFolder) {
        this.priboxFolder = priboxFolder;
        return priboxFolder;
      }
    }
    return null;
  }

  async getSentFolder() {
    if (!this.folders) {
      await this.getFolders();
    }

    const sentFlaggedFolder = this.folders.find((folder) =>
      folder.attributes.map((attr) => attr.toLowerCase()).includes("\\sent")
    );
    if (sentFlaggedFolder) return sentFlaggedFolder;

    const sentFolder = this.folders.find((item) =>
      item.label.toLowerCase().includes("sent")
    );
    if (sentFolder) return sentFolder;

    return null;
  }

  async getSpamFolder() {
    if (!this.folders) {
      await this.getFolders();
    }

    const junkFlaggedFolder = this.folders.find((folder) =>
      folder.attributes.map((attr) => attr.toLowerCase()).includes("\\junk")
    );
    if (junkFlaggedFolder) return junkFlaggedFolder;

    for (const label of ["spam", "junk", "bulk mail"]) {
      const spamFolder = this.folders.find(
        (item) => item.label.toLowerCase() === label
      );
      if (spamFolder) {
        return spamFolder;
      }
    }
    return null;
  }

  async deleteMessage(uids) {
    return this.connection.deleteMessage(uids);
  }

  async getFolders() {
    const boxes = await this.connection.getBoxes();
    let folders = [];

    Object.keys(boxes).forEach((box) => {
      if (!boxes[box].attribs.find((v) => v.toLowerCase() === "\\noselect")) {
        folders.push({ label: box, path: box, attributes: boxes[box].attribs });
      }
      if (boxes[box].children) {
        folders.push(
          ...Object.keys(boxes[box].children).map((child) => ({
            label: child,
            path: `${box}${boxes[box]?.delimiter || "/"}${child}`,
            attributes: boxes[box].children[child].attribs,
          }))
        );
      }
    });

    this.folders = folders;
    return this.folders;
  }
}
