module.exports = function(req, res, next) {
	// console.log ("Query = ",JSON.stringify(req.query));
	// console.log ("Body = ",JSON.stringify(req.body));
	// console.log ("Params = ",JSON.stringify(req.params));
	let page = 101; let subpage = 0;let provider = 0;
	if (typeof req.params.providercode !== "undefined") {
		     provider = req.params.providercode;
	}
	if (typeof req.params.pageno !== "undefined") {
		page = req.params.pageno;
	} 
	req.body["page"] = page;
	req.body["provider"] = provider;
	//console.log("(GET) Body page =", req.body.page, " ;Body provider =", req.body.provider);
    return next();
};