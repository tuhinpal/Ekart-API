const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require("request");
const HtmlTableToJson = require("html-table-to-json");
const ref_url = "https://ekart-api.vercel.app/?id=tracking-id";
const my_github = "https://github.com/cachecleanerjeet";

module.exports = async(req, res) => {
    const id = req.query.id;
    if (id == undefined) {
        res.json({
            status: false,
            msg: "Tracking ID is required",
            format: ref_url,
            made_by_tuhin: my_github
        });
    } else if (id == "") {
        res.json({
            status: false,
            msg: "Tracking ID cannot be empty",
            format: ref_url,
            made_by_tuhin: my_github
        });
    } else {
        const ekarthtml = {
            "method": "GET",
            "url": "https://ekartlogistics.com/track/" + id + "/"
        };
        request(ekarthtml, async function(error, response) {
            if (error) {
                res.json({
                    success: false,
                    msg: "Something went wrong while fetching the details",
                    made_by_tuhin: my_github
                })
            } else {
                const reid = response.body.replace(/data-title/gi, "id");
                const dom = new JSDOM(reid).window.document;

                try {
                    //Merchant Name
                    var mname = dom.getElementsByClassName("txt-orange p-b-3")[0].innerHTML.replace("<b>Merchant name :</b> ", "");

                    // Tracking ID
                    var trackingid = dom.getElementsByTagName("h4")[0].innerHTML.replace("Tracking ID: ", "");

                    // Order Status
                    var status = dom.getElementById("Current Status").innerHTML;
                    if (status == "Delivered") {
                        var otime = dom.getElementById("Delivered On").innerHTML;
                    } else {
                        var otime = "Promised " + dom.getElementById("Promised Delivery Date").innerHTML;
                    };

                    //updates
                    var table = `<table>` + dom.getElementsByClassName("col-md-12 table-bordered table-striped table-condensed cf width-100")[1].innerHTML + `</table>`;
                    const jsonTables = HtmlTableToJson.parse(table);

                    res.json({
                        success: true,
                        tracking_id: trackingid,
                        merchant_name: mname,
                        order_status: status,
                        time: otime,
                        updates: jsonTables.results[0],
                        made_by_tuhin: my_github
                    });
                } catch (err) {
                    res.json({
                        success: false,
                        msg: "Invalid Tracking ID, Kindly recheck and send it again",
                        made_by_tuhin: my_github
                    });
                };
            };
        });
    };
};