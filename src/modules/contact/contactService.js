import {sendMail} from "~/helper/mailer";
import {Account} from "~/models/accountModel";
import {Contact} from "~/models/contactModel"
import {accountService} from "../account/accountService";
import {Notification} from "~/models/NotificationModel";

const sendMessage = async (data) => {
    const contact = new Contact(data);
    await contact.save();

    // Gửi email và tạo thông báo cho tất cả tài khoản
    setImmediate(async () => {
        try {
            const accountList = await Account.find({}, {email: 1});
            const emailContent = `
                <div>
                    <h1>name: ${contact.name}</h1><br/>
                    <h1>email: ${contact.email}</h1><br/>
                    <h1>phone: ${contact.phone}</h1><br/>
                    <h1>title: ${contact.title}</h1><br/>
                    <h1>content: ${contact.content}</h1><br/>
                </div>
            `;
            const sendEmailAndCreateNotification = async (account) => {
                await sendMail(account.email, 'email', emailContent);
                const notification = new Notification({
                    user_id: account._id,
                    message: `Đã gửi email đến ${contact.email}`
                });
                await notification.save();
            };
            await Promise.all(accountList.map(sendEmailAndCreateNotification));
        } catch (error) {
            console.error('Error sending emails or creating notifications:', error);
        }
    });

    return contact;
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