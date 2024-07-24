import {accountRoute} from "./accountRoute"
import {navigationRoute} from "./navigationRoute"
import {categoryRoute} from "./categoryRoute"
import {newsRoute} from "./newsRoute"
import {partnerRoute} from "./partnerRoute"
import {contactRoute} from "./contactRoute"
import {authRoute} from "./authRoute"
import {productRoute} from "./productRoute"
import {departmentRoute} from "./departmentRoute"
import {ConfigRoute} from "./ConfigRoute"
import {ServiceRoute} from "~/routes/serviceRoute";
import {ProjectRoute} from "~/routes/projectRoute";
import {SearchRoute} from "~/routes/SearchRoute";
import {ImageLibraryRoute} from "~/routes/ImageLibraryRoute";
import {VideoLibraryRoute} from "~/routes/VideoLibraryRoute";
import {PageRoute} from "~/routes/PageRoute";
import {notiRoute} from "~/routes/notiRoute";


const initApis = (app) => {
    app.use("/api/navigation", navigationRoute)
    app.use("/api/authenticate", authRoute)
    app.use("/api/account", accountRoute)
    app.use('/api/category', categoryRoute)
    app.use('/api/news', newsRoute)
    app.use("/api/partner", partnerRoute)
    app.use('/api/contact', contactRoute)
    app.use("/api/product", productRoute)
    app.use("/api/department", departmentRoute)
    app.use("/api/configuration", ConfigRoute)
    app.use("/api/services", ServiceRoute)
    app.use("/api/project", ProjectRoute)
    app.use("/api/search", SearchRoute)
    app.use("/api/image", ImageLibraryRoute)
    app.use("/api/video", VideoLibraryRoute)
    app.use("/api/gioi-thieu", PageRoute)
    app.use("/api/notification", notiRoute)
}

export default initApis
