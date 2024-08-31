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
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
            <h2 style="color: #333; text-align: center;">Thông Tin Liên Hệ Mới</h2>
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
                <p><strong style="color: #007bff;">Họ Tên:</strong> ${contact.name}</p>
                <p><strong style="color: #007bff;">Email:</strong> ${contact.email}</p>
                <p><strong style="color: #007bff;">Số Điện Thoại:</strong> ${contact.phone}</p>
                <p><strong style="color: #007bff;">Tiêu Đề:</strong> ${contact.title}</p>
                <p><strong style="color: #007bff;">Nội Dung:</strong></p>
                <p style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff;">${contact.content}</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <a href="mailto:${contact.email}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Phản Hồi</a>
            </div>
        </div>
        <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #aaa;">Email này được gửi từ website VNETC.</p>
    </div>
`;

const createNotification = async (userId, contactEmail) => {
    const notification = new Notification({
        user_id: userId,
        message: `${contactEmail} đã gửi thông tin của họ`
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