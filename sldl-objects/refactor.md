对于未声明的类成员type为Array，aux为0xFFFFFFFF的情况，应该转换为声明组的对象动态数组(Object*[])，程序中错误地输出了pointer*[]，示例见examples/json/01

现对于sldl-objects的重构要求如下：
对于指针类型，将现有的MetaTypePointer修改为继承自MetaTypeFoward，将指针的读写、大小和对齐转发至预定义的uint32_t，同时新增points字段用于表明指针指向的类型。同时，新增类型不相符的对象的指针类型校验，只允许声明组继承链中的子类出现在父类指针处。

对于Clump类型，新增继承自MetaTypeFoward的类MetaTypeClump至metaTypeClass.js中，完全转发至预定义的MetaTypeClass("Clump")，增加泛型指针校验。

将重构同步到sldl-jsonify中
