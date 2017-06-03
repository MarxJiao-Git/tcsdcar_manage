/**
 * 基础数据 - 汽车型号列表
 */
layui.use(['jquery', 'simplePager', 'laydate', 'form', 'layer', 'cookie', 'global', 'upload', 'upmobui', 'element'], function () {
    var $ = layui.jquery,
        layer = layui.layer,
        simplePager = layui.simplePager,
        global = layui.global,
        form = layui.form(),
        upmobui = layui.upmobui,
        element = layui.element();

    var Page = function () {
        this.layer_index = null;
        this.layer_open_index = null;
        this.currentProductPrice = 0;
        this.layer_tips = null;
        this.layer_content = null;
        this.rangeBegin = 1;
        this.rangeEnd = 9999;
        this.pageIndex = 1;
        this.pageSize = 13;
        this.totalPage = 0;
        this.totalSize = 0;
        this.par = this.getParam();
    };

    Page.prototype = {

        init: function () {
            var _self = this;
            upmobui.common.pageFunc(); // 页面共用方法
            simplePager.init();
            upmobui.common.findBalanceForParent();
            _self.getAllBrands(_self.par);
            _self.getBigCategory(_self.par);
            _self.getData(_self.par);
            _self.bindEvent();
        },

        bindEvent: function () {
            var _self = this;
            $("#btn-search").bind('click', function () {
                _self.par.brands = $(".brands_search").val();
                _self.pageIndex = 1;
                if (_self.par.brands && _self.par.brands != -1) {
                    _self.getDataM(_self.par);
                } else {
                    _self.getData(_self.par);
                }
            });

            $('.layui-tab-title').on('click', 'li', function () {
                $('#myIframe', parent.document).attr('src', $(this).data('href'));
            });

            $('#dg_list').on('mouseover mouseout', 'td', function (event) {

                if (!$(this).data('ct')) {
                    return;
                }
                if (event.type == "mouseover") {
                    //鼠标悬浮
                    _self.layer_content = String($(this).data('ct'));
                    _self.layer_content = _self.layer_content.replace('<', '&lt');
                    _self.layer_tips = layer.tips(_self.layer_content, $(this), {
                        tips: [1, '#555'] //还可配置颜色
                    });
                } else if (event.type == "mouseout") {
                    //鼠标离开
                    layer.close(_self.layer_tips);
                }
            })

            var edit_win = $("#pop_up");
            $("#btn_add").bind('click', function (event) {
                var content = edit_win.html();
                _self.layer_open_index = layer.open({
                    type: 1,
                    title: '新增汽车型号',
                    area: ['700px', 'auto'], //宽高
                    fixed: false, //不固定
                    maxmin: true,
                    content: content
                });
                form.render();
                $("#pop_up").remove();
                _self.addProductAction(0);
            });

            // 删除项
            $(document).on('click', '.btn-del', function (event) {
                event.preventDefault();
                var id = $(this).data('id');
                var par = _self.getParam();
                par.ids = id;
                layer.confirm('是否删除此汽车型号?', {
                    btn: ['是', '否']
                }, function () {
                    $.post(global.url.deleteProduct, par, function (data, textStatus, xhr) {
                        if (data.code == 200) {
                            layer.msg('删除成功！', { time: 500 }, function () {
                                _self.getData(par);
                            });
                        } else {
                            layer.msg("删除失败，请重试！", { time: 500 });
                        }
                    });
                }, function () {
                    layer.closeAll();
                });
            });

            // 编辑项
            $(document).on('click', '.btn-edit', function () {
                var _this = $(this);
                var id = _this.data('id');
                _self.getAllProducts(_self.par, id, function (data) {
                    var productName = _this.data('productname');
                    var brands = _this.data('brands');
                    var content = edit_win.html();
                    _self.layer_open_index = layer.open({
                        type: 1,
                        title: '编辑汽车型号',
                        area: ['700px', 'auto'], //宽高
                        fixed: false, //不固定
                        maxmin: true,
                        content: content
                    });
                    $('.layui-layer-content [name=name]').val(productName);
                    $('.layui-layer-content .carTypeName [name=id]').val(id);
                    $('.layui-layer-content [name=brandsId]').val(brands);
                    $('.layui-layer-content [name=brands]').val(brands);
                    $('.layui-layer-content [name=productModelId]').val(id);

                    if (data.totalSize > 0) {
                        for (var i = 0; i < data.totalSize; i++) {
                            var product = data.content[i];
                            $('.layui-layer-content #productForm' + i + ' [name=id]').val(product.id);
                            $('.layui-layer-content #productForm' + i + ' [name=twelveCyclePrice]').val(product.twelveCyclePrice);
                            $('.layui-layer-content #productForm' + i + ' [name=twentyFourCyclePrice]').val(product.twentyFourCyclePrice);
                            $('.layui-layer-content #productForm' + i + ' [name=thirtySixCyclePrice]').val(product.thirtySixCyclePrice);
                            $('.layui-layer-content #productForm' + i + ' [name=productDesc]').val(product.productDesc);
                        }
                    }
                    form.render();
                    $("#pop_up").remove();
                    _self.addProductAction(1);
                });
            });
            // 显示价格
            $(document).on('click', '.show_price', function () {
                var id = $(this).data('id');
                var name = $(this).data('name');
                _self.getAllProducts(_self.par, id, function (data) {
                    var content = $("#show_product_price").html();
                    _self.layer_open_index = layer.open({
                        type: 1,
                        title: name + '的产品价格',
                        area: ['700px', 'auto'], //宽高
                        fixed: false, //不固定
                        maxmin: true,
                        content: content
                    });
                    if (data.totalSize > 0) {
                        for (var i = 0; i < data.totalSize; i++) {
                            var product = data.content[i];
                            $('.layui-layer-content #product' + i + ' [name=id]').val(product.id);
                            $('.layui-layer-content #product' + i + ' [name=twelveCyclePrice]').val(product.twelveCyclePrice);
                            $('.layui-layer-content #product' + i + ' [name=twentyFourCyclePrice]').val(product.twentyFourCyclePrice);
                            $('.layui-layer-content #product' + i + ' [name=thirtySixCyclePrice]').val(product.thirtySixCyclePrice);
                            $('.layui-layer-content #product' + i + ' [name=productDesc]').val(product.productDesc);
                        }
                    }
                });
            });
            // 选择大类后，调用查询小类接口
            form.on('select(bigCategory)', function () {
                var selectBigCategory = $('.bigCategory option:selected').val();
                _self.getSmallCategory(_self.par, selectBigCategory);
            });
            // 点击图片填充名字
            // $(document).on('change', '.layui-upload-file', function () {
            //     var f = document.getElementsByClassName('layui-upload-file');
            //     var filename = f.imagefile.files[0].name;
            //     filename = filename.substring(0,filename.indexOf('.'));
            //     // var fileArray= filename.split('-');
            //     $("input[type='text'][name='productName']").val(filename);
            //     // $("input[type='text'][name='productName']").val(fileArray[0]);
            //     // $("input[type='text'][name='twelveCyclePrice']").val(fileArray[1]);
            //     // $("input[type='text'][name='twentyFourCyclePrice']").val(fileArray[2]);
            //     // $("input[type='text'][name='thirtySixCyclePrice']").val(fileArray[3]);
            //     // alert(filename) ;
            // });
        },
        getParam: function () {
            var par = {};
            par.token = $.cookie('userToken');
            return par;
        },
        getData: function (par) {
            var _self = this;
            par.pageIndex = _self.pageIndex;
            par.pageSize = _self.pageSize;
            // par.statu = 0;
            // par.categroyId = '12';
            // par.brandsId = '12';
            $.ajax({
                url: global.url.findAllProductModel,
                type: 'GET',
                dataType: 'json',
                data: par,
                beforeSend: function () {
                    _self.showLoadin();
                },
                success: function (data) {
                    _self.hideLoadin();
                    if (undefined != data.data && null != data.data && data.code == 200) {
                        var dataList = data.data.content;
                        var html = "";
                        var len = dataList.length;
                        if (len > 0) {
                            for (var i = 0; i < len; i++) {

                                html += '<tr>';
                                html += '<td>' + (i - 0 + 1) + '</td>';
                                html += '<td><img style="width: 30px;" src="../../../images/product/' + dataList[i].id + '.png"></td>';
                                html += '<td>' + dataList[i].brandsName + dataList[i].name + '</td>';
                                html += '<td><a data-id="' + dataList[i].id + '" data-name="' + dataList[i].brandsName + dataList[i].name + '" class="show_price" href="javascript:;" style="color: #00bbfe;text-decoration: underline">点击查看产品价格</a></td>';
                                html += '<td>' + dataList[i].createTimeStr + '</td>';
                                html += '<td>'
                                    + '<a href="javascript:void(0);" data-id="' + dataList[i].id + '"  data-brands="' + dataList[i].brandsId + '" data-productname="' + dataList[i].name + '" class="layui-btn layui-btn-mini btn-edit">编辑</a>'
                                    + '<a href="javascript:void(0);" data-id="' + dataList[i].id + '" class="layui-btn layui-btn-mini layui-btn-danger btn-del">删除</a>'
                                    + '</td>';
                                html += '</tr>';
                            }
                            $("#dg_list tbody").empty().append(html);


                            _self.totalSize = data.data.totalSize;
                            _self.totalPage = Math.ceil(_self.totalSize / _self.pageSize);
                            $('.pager-footer').show();
                            simplePager.setup({
                                item: '.simple-pager-wrapper .simple-pager',
                                data: data.data,
                                pageIndex: _self.pageIndex,
                                pageSize: _self.pageSize,
                                showPageCount: 5,
                                cbclick: function (pageIndex) {

                                    _self.pageIndex = pageIndex;
                                    _self.getData(par);
                                    return false;
                                }
                            });
                        } else {
                            $("#dg_list tbody").empty();
                            layer.msg("暂无汽车型号", { time: 1200 });
                        }
                        if (typeof successCallback === "function") {
                            successCallback(data.code);
                        }
                        setTimeout(function () {
                            $('#myIframe', parent.document).height($('#myIframe', parent.document).contents().find('body').height());
                        }, 100)
                    } else {
                        $("#dg_list tbody").empty();
                        $('.pager-footer').hide();
                        setTimeout(function () {
                            $('#myIframe', parent.document).height($('#myIframe', parent.document).contents().find('body').height());
                            layer.msg("没有相关数据", { time: 1200 });
                        }, 100)
                        if (data.code == 510) {
                            layer.msg('登录已失效，请重新登录...', { time: 1200 }, function () {
                                window.parent.location.href = 'login.html';
                            });
                        }
                    }
                },
                error: function (e) {
                    _self.hideLoadin();
                    layer.msg('获取数据失败，请稍后重试！', { time: 500 });
                }
            })
        },
        getDataM: function (par) {
            var _self = this;
            par.pageIndex = _self.pageIndex;
            par.pageSize = _self.pageSize;
            $.ajax({
                url: global.url.findProductListm,
                type: 'GET',
                dataType: 'json',
                data: par,
                beforeSend: function () {
                    _self.showLoadin();
                },
                success: function (data) {
                    _self.hideLoadin();
                    if (undefined != data.data && null != data.data && data.code == 200) {
                        var dataList = data.data.content;
                        var html = "";
                        var len = dataList.length;
                        if (len > 0) {
                            for (var i = 0; i < len; i++) {

                                html += '<tr>';
                                html += '<td>' + (i - 0 + 1) + '</td>';
                                html += '<td><img style="width: 30px;" src="../../../images/product/' + dataList[i].id + '.png"></td>';
                                // html += '<td><img style="height: 30px;" src="' + dataList[i].imageUrl + '"></td>';
                                html += '<td>' + dataList[i].brandsName + dataList[i].name + '</td>';
                                // html += '<td>' + dataList[i].bigCategoryName + dataList[i].smallCategoryName + '</td>';
                                html += '<td><a data-id="' + dataList[i].id + '" data-name="' + dataList[i].brandsName + dataList[i].name + '" class="show_price" href="javascript:;" style="color: #00bbfe;text-decoration: underline">点击查看产品价格</a></td>';
                                html += '<td>' + dataList[i].createTimeStr + '</td>';
                                // html += '<td >' + dataList[i].productDesc + '</td>';
                                html += '<td>'
                                    + '<a href="javascript:void(0);" data-brands="' + dataList[i].brands + '" data-id="' + dataList[i].id + '" data-productname="' + dataList[i].productName + '" class="layui-btn layui-btn-mini btn-edit">编辑</a>'
                                    + '<a href="javascript:void(0);" data-id="' + dataList[i].id + '" class="layui-btn layui-btn-mini layui-btn-danger btn-del">删除</a>'
                                    + '</td>';
                                html += '</tr>';
                            }
                            $("#dg_list tbody").empty().append(html);


                            _self.totalSize = data.data.totalSize;
                            _self.totalPage = Math.ceil(_self.totalSize / _self.pageSize);
                            $('.pager-footer').show();
                            simplePager.setup({
                                item: '.simple-pager-wrapper .simple-pager',
                                data: data.data,
                                pageIndex: _self.pageIndex,
                                pageSize: _self.pageSize,
                                showPageCount: 5,
                                cbclick: function (pageIndex) {

                                    _self.pageIndex = pageIndex;
                                    _self.getDataM(par);
                                    return false;
                                }
                            });
                        } else {
                            $("#dg_list tbody").empty();
                            layer.msg("暂无汽车型号", { time: 1200 });
                        }
                        if (typeof successCallback === "function") {
                            successCallback(data.code);
                        }
                        setTimeout(function () {
                            $('#myIframe', parent.document).height($('#myIframe', parent.document).contents().find('body').height());
                        }, 100)
                    } else {
                        $("#dg_list tbody").empty();
                        $('.pager-footer').hide();
                        setTimeout(function () {
                            $('#myIframe', parent.document).height($('#myIframe', parent.document).contents().find('body').height());
                            layer.msg("没有相关数据", { time: 1200 });
                        }, 100)
                        if (data.code == 510) {
                            layer.msg('登录已失效，请重新登录...', { time: 1200 }, function () {
                                window.parent.location.href = 'login.html';
                            });
                        }
                    }
                },
                error: function (e) {
                    _self.hideLoadin();
                    layer.msg('获取数据失败，请稍后重试！', { time: 500 });
                }
            })
        },
        addProductAction: function (flag) {
            var _self = this;
            $('.js-btn-update').bind('click', function () {
                if (_self.checkForm(flag)) {
                    var formData = new FormData($("#uploadForm")[0]);
                    formData.append("token", $.cookie('userToken'));
                    formData.append("statu", '0');//中型
                    $.ajax({
                        url: global.url.saveProductModel,
                        type: 'POST',
                        dataType: 'json',
                        data: formData,
                        contentType: false,
                        processData: false,
                        beforeSend: function () {
                            _self.showLoadin();
                            $('.js-btn-update')[0].disabled = true;
                        },
                        success: function (data) {
                            if (undefined != data && null != data && data.code == 200) {
                                _self.addProducts(data.data);
                            } else {
                                _self.hideLoadin();
                                $('.js-btn-update')[0].disabled = false;
                                if (data.code == 510) {
                                    layer.msg('登录已失效，请重新登录...', { time: 1200 }, function () {
                                        window.parent.location.href = 'login.html';
                                    });
                                } else {
                                    layer.msg('操作失败!', { time: 1200 });
                                }
                            }
                        },
                        error: function (e) {
                            $('.js-btn-update')[0].disabled = false;
                            _self.hideLoadin();
                            layer.msg('系统错误，请稍后重试！', { time: 500 });
                        }
                    })
                }
            });
        },
        addProducts: function (id) {
            var _self = this;
            $('.layui-layer-content #productForm0 [name=id]').val(id);
            $('.layui-layer-content #productForm1 [name=id]').val(id);

            $('.layui-tab-content form').each(function (index, element) {
                var formData = new FormData($("#productForm" + index)[0]);
                formData.append("token", $.cookie('userToken'));
                formData.append("statu", '0');
                if (index == 0) {
                    formData.append("productName", '汽车膜产品');
                } else if (index == 1) {
                    formData.append("productName", '玻璃险产品');
                }
                $.ajax({
                    url: global.url.addProduct,
                    type: 'POST',
                    dataType: 'json',
                    data: formData,
                    contentType: false,
                    processData: false,
                    beforeSend: function () {
                        $('.js-btn-update')[0].disabled = true;
                    },
                    success: function (data) {
                        if (undefined != data && null != data && data.code == 200) {
                            if (index >= 1) {
                                // _self.hideLoadin();
                                if (_self.par.brands && _self.par.brands != -1) {
                                    _self.getDataM(_self.par);
                                } else {
                                    _self.getData(_self.par);
                                }
                                layer.close(_self.layer_open_index);
                            }
                        } else {
                            _self.hideLoadin();
                            $('.js-btn-update')[0].disabled = false;
                            if (data.code == 510) {
                                layer.msg('登录已失效，请重新登录...', { time: 1200 }, function () {
                                    window.parent.location.href = 'login.html';
                                });
                            } else {
                                layer.msg('操作失败!', { time: 1200 });
                            }
                        }
                    },
                    error: function (e) {
                        $('.js-btn-update')[0].disabled = false;
                        _self.hideLoadin();
                        layer.msg('系统错误，请稍后重试！', { time: 500 });
                    }
                })
            });

        },
        toRoundOff: function (num) {
            if (num.toString().indexOf('.') > -1) {
                num = Number(num.toString().substring(0, num.toString().indexOf('.') + 3));
            }
            return num;
        },
        checkForm: function (flag) {
            var brandid = $('.layui-layer-content [name=brandsId]').val();
            if (!brandid || brandid == -1) {
                layer.msg('所属品牌不能为空！', { time: 1200 });
                return false;
            }
            var name = $('.layui-layer-content [name=name]').val();
            if (!name) {
                layer.msg('汽车型号名称不能为空！', { time: 1200 });
                return false;
            }
            var bigCategory = $('.layui-layer-content [name=bigCategory]').val();
            if (!bigCategory || bigCategory == -1) {
                layer.msg('车型类别一不能为空！', { time: 1200 });
                return false;
            }
            var smallCategory = $('.layui-layer-content [name=categroyId]').val();
            if (!smallCategory || smallCategory == -1) {
                layer.msg('车型类别二不能为空！', { time: 1200 });
                return false;
            }

            var namef = $('.layui-layer-content [name=imagefile]').val();
            if (!namef && flag != 1) {
                layer.msg('图片不能为空！', { time: 1200 });
                return false;
            }

            var twelveCyclePrice = $('.layui-layer-content #productForm0 [name=twelveCyclePrice]').val();
            if (!twelveCyclePrice) {
                layer.msg('汽车膜质保12期价格不能为空！', { time: 1200 });
                return false;
            }

            var twentyFourCyclePrice = $('.layui-layer-content #productForm0 [name=twentyFourCyclePrice]').val();
            if (!twentyFourCyclePrice) {
                layer.msg('汽车膜质保24期价格不能为空！', { time: 1200 });
                return false;
            }

            var thirtySixCyclePrice = $('.layui-layer-content #productForm0 [name=thirtySixCyclePrice]').val();
            if (!thirtySixCyclePrice) {
                layer.msg('汽车膜质保36期价格不能为空！', { time: 1200 });
                return false;
            }
            twelveCyclePrice = $('.layui-layer-content #productForm1 [name=twelveCyclePrice]').val();
            if (!twelveCyclePrice) {
                layer.msg('玻璃险12期价格不能为空！', { time: 1200 });
                return false;
            }

            twentyFourCyclePrice = $('.layui-layer-content #productForm1 [name=twentyFourCyclePrice]').val();
            if (!twentyFourCyclePrice) {
                layer.msg('玻璃险24期价格不能为空！', { time: 1200 });
                return false;
            }

            thirtySixCyclePrice = $('.layui-layer-content #productForm1 [name=thirtySixCyclePrice]').val();
            if (!thirtySixCyclePrice) {
                layer.msg('玻璃险36期价格不能为空！', { time: 1200 });
                return false;
            }
            return true;
        },
        getAllBrands: function (par) {
            var _self = this;
            par.pageIndex = 1;
            par.pageSize = 99999;
            $.ajax({
                url: global.url.findAllProductBrands,
                type: 'GET',
                dataType: 'json',
                data: par,
                success: function (data) {
                    if (undefined != data.data && null != data.data && data.code == 200) {
                        var dataList = data.data.content;
                        var sb = new _self.StringBuffer();
                        $.each(dataList, function (i, val) {
                            sb.append("<option value='" + val.id + "'>" + val.name + "</option>");
                        });
                        var op = "<option class='brands-option' value='-1'>请选择品牌</option>";
                        $(".brands_search").empty().append(op).append(sb.toString());
                        $(".brands").empty().append(op).append(sb.toString());
                        form.render('select');
                    }
                }
            })
        },
        getBigCategory: function (par) {
            var _self = this;
            par.pageIndex = 1;
            par.pageSize = 999;
            par.level = 1;
            $.ajax({
                url: global.url.findAllProductCategory,
                type: 'GET',
                dataType: 'json',
                data: par,
                success: function (data) {
                    delete _self.par.level;
                    if (undefined != data.data && null != data.data && data.code == 200) {
                        var dataList = data.data.content;
                        var len = dataList.length;
                        if (len > 0) {
                            var sb = new _self.StringBuffer();
                            for (var i = 0; i < len; i++) {
                                sb.append("<option value='" + dataList[i].id + "'>" + dataList[i].name + "</option>");
                            }
                            var op = "<option class='bigCategory-option' value='-1'>请选择车型类别一</option>";
                            $(".bigCategory").empty().append(op).append(sb.toString());
                            form.render('select');
                        }

                    }
                }
            })
        },
        getSmallCategory: function (par, selectBigCategory) {
            var _self = this;
            par.pageIndex = 1;
            par.pageSize = 999;
            par.level = 2;
            par.parent = selectBigCategory;
            $.ajax({
                url: global.url.findAllProductCategory,
                type: 'GET',
                dataType: 'json',
                data: par,
                success: function (data) {
                    if (undefined != data.data && null != data.data && data.code == 200) {
                        var dataList = data.data.content;
                        var len = dataList.length;
                        if (len > 0) {
                            var sb = new _self.StringBuffer();
                            for (var i = 0; i < len; i++) {
                                sb.append("<option value='" + dataList[i].id + "'>" + dataList[i].name + "</option>");
                            }
                            var op = "<option class='categroyId-option' value='-1'>请选择车型类别二</option>";
                            $(".categroyId").empty().append(op).append(sb.toString());
                            form.render('select');
                        }

                    }
                }
            })
        },
        getAllProducts: function (par, productModelId, callback) {
            var _self = this;
            par.pageIndex = 1;
            par.pageSize = 999;
            par.productModelId = productModelId;
            $.ajax({
                url: global.url.findProductList,
                type: 'GET',
                dataType: 'json',
                data: par,
                beforeSend: function () {
                    _self.showLoadin();
                },
                success: function (data) {
                    if (undefined != data.data && null != data.data && data.code == 200) {
                        if (typeof callback === "function") {
                            _self.hideLoadin();
                            callback(data.data);
                        }
                    }
                }
            })
        },
        StringBuffer: function (str) {
            var arr = [];
            str = str || "";
            var size = 0;  // 存放数组大小
            arr.push(str);
            // 追加字符串
            this.append = function (str1) {
                arr.push(str1);
                return this;
            };
            // 返回字符串
            this.toString = function () {
                return arr.join("");
            };
            // 清空
            this.clear = function (key) {
                size = 0;
                arr = [];
            }
            // 返回数组大小
            this.size = function () {
                return size;
            }
            // 返回数组
            this.toArray = function () {
                return buffer;
            }
            // 倒序返回字符串
            this.doReverse = function () {
                var str = buffer.join('');
                str = str.split('');
                return str.reverse().join('');
            }
        },
        hideLoadin: function () {
            $('#loadingToast').addClass('hide');
        },
        showLoadin: function (content) {
            $('#loadingToast').removeClass('hide');
            if (content) {
                $('.weui_toast_content').text(content);
            }
        }
    }

    var page = new Page();
    page.init();

    layui.upload({
        url: 'http://www.baidu.com'
        , success: function (res) {
            console.log(res); //上传成功返回值，必须为json格式
            alert(res);
        }
    });
});
