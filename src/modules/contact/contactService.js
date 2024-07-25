import {sendMail} from "~/helper/mailer";
import {Account} from "~/models/accountModel";
import {Contact} from "~/models/contactModel"
import {accountService} from "../account/accountService";
import {Notification} from "~/models/NotificationModel";

const sendMessage = async (data) => {
    const contact = await saveContact(data);
    setImmediate(() => sendEmailsAndNotifications(contact));
    return contact;
};

const saveContact = async (data) => {
    const contact = new Contact(data);
    await contact.save();
    return contact;
};

const sendEmailsAndNotifications = async (contact) => {
    try {
        const accountList = await Account.find({}, {email: 1});
        await Promise.all(accountList.map(account =>
            sendEmailAndCreateNotification(account, contact)
        ));
    } catch (error) {
        console.error('Error in sendEmailsAndNotifications:', error);
    }
};

const sendEmailAndCreateNotification = async (account, contact) => {
    try {
        await sendMail(account.email, 'email', createEmailContent(contact));
        await createNotification(account._id, contact.email);
    } catch (error) {
        console.error(`Error processing account ${account._id}:`, error);
    }
};

const createEmailContent = (contact) => `
    <div>
        <h1>name: ${contact.name}</h1><br/>
        <h1>email: ${contact.email}</h1><br/>
        <h1>phone: ${contact.phone}</h1><br/>
        <h1>title: ${contact.title}</h1><br/>
        <h1>content: ${contact.content}</h1><br/>
    </div>
`;

const createNotification = async (userId, contactEmail) => {
    const notification = new Notification({
        user_id: userId,
        message: `Đã gửi email đến ${contactEmail}`
    });
    await notification.save();
};
const getMessage = async (data) => {
    const {page = 0, limit = 5,} = data
    const messages = await Contact.find()
        .skip(page * limit)
        .limit(limit)
        .sort({createdAt: -1})
    return messages
}
const deleteMessage = async (data) => {
    try {
        const result = await Contact.findByIdAndDelete(data)
        if (!result) throw new ApiErr(444, "Delete fail")
        return result
    } catch (e) {
        throw e
    }
}

export const contactService = {
    sendMessage,
    getMessage,
    deleteMessage
}