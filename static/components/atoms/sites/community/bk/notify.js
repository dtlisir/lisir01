(function () {
    $.atoms.bk_notify = [
        {
            tag_code: "bk_notify_type",
            type: "checkbox",
            attrs: {
                name: gettext("通知方式"),
                hookable: true,
                items: [
                    {name: gettext("微信"), value: "weixin"},
                    {name: gettext("邮件"), value: "email"},
                    {name: gettext("短信"), value: "sms"}
                ],
                default: ["weixin"],
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            var result = {
                                result: true,
                                error_message: ""
                            };
                            if (value && !(value.length > 0)) {
                                result.result = false;
                                result.error_message = gettext("请至少选择一种通知方式");
                            }
                            return result;
                        }
                    }
                ]
            }
        },
        {
            tag_code: "bk_receiver_info",
            type: "combine",
            attrs: {
                name: gettext("通知分组"),
                hookable: true,
                children: [
                    {
                        tag_code: "bk_receiver_group",
                        type: "checkbox",
                        attrs: {
                            name: gettext("通知分组"),
                            items: [
                                {name: gettext("运维人员"), value: "Maintainers"},
                                {name: gettext("产品人员"), value: "ProductPm"},
                                {name: gettext("开发人员"), value: "Developer"},
                                {name: gettext("测试人员"), value: "Tester"},
                            ],
                            default: ["Maintainers"],
                            validation: [
                                {
                                    type: "custom",
                                    args: function (value, parent_value) {
                                        var self = this;
                                        var result = {
                                            result: true,
                                            error_message: ""
                                        };
                                        if (self.get_parent && !self.get_parent().get_child('bk_more_receiver').value && value && !(value.length > 0)) {
                                            result.result = false;
                                            result.error_message = gettext("请至少选择一个通知分组");
                                        }
                                        return result;
                                    }
                                },
                            ]
                        }
                    },
                    {
                        tag_code: "bk_more_receiver",
                        type: "input",
                        attrs: {
                            name: gettext("附加人员"),
                            placeholder: gettext("填写用户名，多个用户名用 , 分隔"),
                            validation: [
                                {
                                    type: "custom",
                                    args: function (value) {
                                        var self = this;
                                        var result = {
                                            result: true,
                                            error_message: ""
                                        };
                                        if (self.get_parent && !(self.get_parent().get_child('bk_receiver_group').value.length > 0) && !(value.length > 0)) {
                                            result.result = false;
                                            result.error_message = gettext("请输入附加人员");
                                        }
                                        return result;
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            tag_code: "bk_notify_title",
            type: "input",
            attrs: {
                name: gettext("通知主题"),
                hookable: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        },
        {
            tag_code: "bk_notify_content",
            type: "textarea",
            attrs: {
                name: gettext("通知内容"),
                hookable: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        }
    ]
})();