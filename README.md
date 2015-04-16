# angular-widget
Set of directives which provides resize and drag and drop of recursive widget elements

- any widget can be resized and drag and droped respecting its parent

[Example of usage on Codepen](http://codepen.io/tomas-holub/pen/YXKKBB)

- create the widget definition object and attach it to the controller scope:


        $scope.widgets = [{
            name: 'grandpa',
            style: {
                background: '#ccc',
                height: '300px',
                width: '300px',
                left: '0px',
                top: '0px',
                border: '1px solid black',
                borderRadius: '6px',
                rotate: 45
            },
            children: [{
                name: 'father',
                style: {
                    background: 'red',
                    height: '200px',
                    width: '200px',
                    left: '0px',
                    top: '0px'
                },
                children: [{
                .
                .
                .

- create holder and widget elements in markup:
```HTML
<div ng-controller="WidgetController as widget">
          <div class="holder">
            <div grid='widgets'></div>
        </div>
</div>
```
