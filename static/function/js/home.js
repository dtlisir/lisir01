$(function() {
    "use strict"

    //表格(DataTables) start
    var language = {
        search: '',
        processing: gettext('加载中'),
        lengthMenu: gettext("每页显示 _MENU_ 记录"),
        zeroRecords: gettext("没找到相应的数据！"),
        info: gettext("共 _TOTAL_ 条记录，当前第 _PAGE_ / _PAGES_"),
        infoEmpty: gettext("暂无数据！"),
        infoFiltered: gettext("(从 _MAX_ 条数据中搜索)"),
        paginate: {
            first: gettext('首页'),
            last: gettext('尾页'),
            previous: gettext('上一页'),
            next: gettext('下一页'),
        }
    };

    var datasource_api = SITE_URL + "api/v3/function_task/";
    var columns = [
        {
            data: "id"
        },{
            data: null,
            render: function (data) {
                return data.task.business.cc_name;
            }
        }, {
            data: null,
            render: function (data) {
                return data.create_time;
            }
        }, {
            data: null,
            render: function (data) {
                return data.creator;
            }
        }, {
            data: null,
            render: function (data) {
                return data.claim_time ? data.claim_time : '--';
            }
        }, {
            data: null,
            render: function (data) {
                return data.claimant ? data.claimant : '--';
            }
        }, {
            data: null,
            render: function (data) {
                if (data.status == 'finished') {
                    return '<span class="label-success">' + gettext('完成') + '</span>';
                } else if (data.status == 'submitted'){
                    return '<span class="label-primary">' + gettext('未认领') + '</span>';
                } else if (data.status == 'rejected'){
                    return '<span class="label-danger">' + gettext('已驳回') + '</span>';
                } else {
                    return '<span class="label-warning">' + gettext(data.status_name) + '</span>';
                }
            }
        }
    ];
    var render_name_func = function (data) {
        return '<a class="recording" title="' + htmlspecialchars(data.task.name) + '" href="' + SITE_URL + 'taskflow/execute/' + data.task.business.cc_id + '/?instance_id=' + data.task.id +'">' + htmlspecialchars(data.task.name) + '</a>';
    };
    columns.splice(7, 0, {
        data: null,
        orderable: false,
        render: function (data, type, row, meta) {
            if (data.status == 'submitted') {
                return '<div class="elastic1">' +
                    '<button class="king-btn king-info w-auto mr5" style="border-radius: 0">' + gettext('认领') + '</button>' +
                    '</div> ';
            } else {
                return '<div class="elastic1">' +
                    '<button class="king-btn king-default w-auto mr5" style="border-radius: 0">' + gettext('查看') + '</button>' +
                    '</div> ';
            }
        }
    });
    columns.splice(2, 0, {
        data: null,
        render: render_name_func,
    });

    $("#function_datatables").dataTable({
        autoWidth: false,
        lengthChange: false, //是否允许用户改变表格每页显示的记录数
        pageLength: 10, //每页显示几条数据
        pagingType: 'full_numbers',
        processing: true,
        serverSide: true,
        current_draw: undefined,
        ajax: function (data, callback, oSettings) {
            var that = this;
            var params = {
                limit: data.length,
                offset: data.start,
            };
            // 关键字过滤
            if (data.search.value) {
                params['q'] = data.search.value;
            }
            // 任务类型过滤
            $.ajax({
                type: "GET",
                url: datasource_api,
                dataType: "JSON",
                data: params,
                success: function (response) {
                    if (that.current_draw == undefined) {
                        that.current_draw = data.draw;
                    }
                    var json = {
                        data: response.objects.map(function(x){
                            return x;
                        }),
                        recordsTotal: response.meta.total_count,
                        draw: that.current_draw++,
                        //recordsFiltered: data.length,
                        recordsFiltered: response.meta.total_count,
                    }
                    callback(json);
                },
                error: function (e) {
                    alert_msg(e, 4);
                }
            });
        },
        ordering: false,
        // 表格对应列的数据
        columns: columns,
        language: language,
    }).on('draw.dt', function () {
        $("#function_datatables_filter").find('input').attr('placeholder', gettext('请输入关键字'));
        $("#function_datatables_filter").show();
        $("#function_datatables_filter").parent().addClass('filter-myStyle').siblings('.col-sm-6').addClass('length-myStyle');
    });
    
    //查看按钮绑定事件
    $("#function_datatables tbody").on('click', '.elastic1 button', function() {
        var tr_dom = $(this).parents('tr');
        tr_dom.find('td a')[0].click();
    });

    //创建任务
    $('.workList').on('click', '#create-new-task', function(){
        vm.$data.biz_list = []
        vm.$data.template_list = []
        $.ajax({
            url: site_url + 'api/v3/business/',
            type: 'GET',
            dataType: 'json'
        }).done(function(resp){
            var biz_list = resp.objects.map(function(item){
                return {
                    id: item.cc_id,
                    text: item.cc_name
                }
            })
            vm.$data.biz_list = biz_list
            $(".elastic-box").addClass('onShow')
            // select2 下拉选项多选
            $("#select-biz").select2({
                placeholder: gettext("请选择业务"),
                allowClear: true
            });
            // select2 下拉选项多选
            $("#select-template").select2({
                placeholder: gettext("请选择模板"),
                allowClear: true
            });
        })
    })
    //切换业务
    $("#select-biz").on("select2-selecting", function(e, val){
        var biz_id = e.val
        vm.$data.template_list = []
        $.ajax({
            url: site_url + 'api/v3/template/',
            type: 'GET',
            dataType: 'json',
            data: {
                business__cc_id: biz_id
            }
        }).done(function(resp){
            var template_list = resp.objects.map(function(item){
                return {
                    id: item.id,
                    text: item.name
                }
            })
            vm.$data.template_list = template_list
        })
        
    })

    //数据源请求
    var vm = new Vue({
        el: '#function_center',
        data:{
            biz_list:[],      //业务列表
            template_list:[], //模板列表
            is_close: false
        },
        methods:{
            // 点击创建
            createNewTask: function(){
                // 业务id
                var biz_id = $("#select-biz").select2("val");
                // 模板id
                var tempalte_id = $("#select-template").select2('val');
                // debugger
                if (!biz_id) {
                    show_msg(gettext("请选择业务"), 'warning')
                    return
                }
                if (!tempalte_id) {
                    show_msg(gettext("请选择模板"), 'warning')
                    return
                }
                var path = site_url + 'template/newtask/' + biz_id + '/selectnode/?template_id=' + tempalte_id
                window.location.href = window.location.protocol + "//" + window.location.host + path
            },
        }
    })
    $(".btn-tow").find(".qx").click(function(){
        $(".elastic-box").removeClass('onShow');
    });
});
