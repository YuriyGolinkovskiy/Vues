Vue.component('list', {
    data: function () {
        return {
            pageNumber: 0,
            data: request()
        }
    },
    props: {
        size: {
            type: Number,
            required: false,
            default: 10
        }
    },
    methods: {
        nextPage: function () {
            this.pageNumber++;
        },
        prevPage: function () {
            this.pageNumber--;
        }
    },
    computed: {
        pageCount: function () {
            var l = this.data.length,
                s = this.size;
            return Math.floor(l / s);
        },
        paginatedData: function () {
            var start = this.pageNumber * this.size,
                end = start + this.size;
            return this.data.slice(start, end);
        }
    },
    template: `<div>
                    <h2>Все статьи</h2>
                        <ul class="beads">
                            <li v-for="p in paginatedData">
                                <router-link :to="{name:'post',params:{id:p.id-1}}">{{p.title}}</router-link>
                            </li> 
                        </ul>
                    <div class="flex-container">
                        <button 
                            :disabled="pageNumber === 0" 
                            @click="prevPage">
                            Previous
                        </button>
                        <button 
                            :disabled="pageNumber >= pageCount -1" 
                            @click="nextPage">
                            Next
                        </button>
                    </div>
                </div>
  `
});
Vue.component('post', {
    data: function () {
        return {
            data: request(),
            images: image(),
            comment: comment(),
            postId: this.$route.params.id,
            favorites: [],
        }
    },
    mounted() {
        if (localStorage.favorites) {
            this.favorites = JSON.parse(localStorage.getItem('favorites'));
        }
    },
    methods: {
        nextPage: function () {
            this.postId++;
            window.location.href = "/#/post/" + this.postId;
        },
        prevPage: function () {
            this.postId--;
            window.location.href = "/#/post/" + this.postId;
        },
        addToFavorite: function () {
            this.favorites[this.postId] = {
                data: this.data[this.postId],
                image: this.images[this.postId],
                comment: this.comment[this.postId],
            };
            this.saveFavorite();
            this.favorites = JSON.parse(localStorage.getItem('favorites'));
        },
        removeFromFavorite: function (x) {
            this.favorites.splice(x, 1, null);
            this.saveFavorite();
        },
        saveFavorite: function () {
            const parsed = JSON.stringify(this.favorites);
            localStorage.setItem('favorites', parsed);
        }
    },
    template: `<div>
                <div class="post"> 
                    <h3 v-if="data[postId]"><span>{{data[postId].title}}</span></h3>   
                </div>
                <div class="flex-container">
                    <p v-if="data[postId]">{{data[postId].body}}</p>
                    <img height = "400px" width="600px" v-if="images[postId]" v-bind:src="images[postId].url" v-bind:alt="'error: image not loading: '+images[postId].filename">
                </div>
                <div class="addFavorites">
                    <button v-if="!favorites[postId]" @click="addToFavorite()"><span>Добавить в избранное</span></button>
                    <button v-if="favorites[postId]" @click="removeFromFavorite(postId)"><span>Удалить из избранного</span></button>
                </div>
                <div class="flex-container">
                    <button 
                        :disabled="postId <= 0" 
                        @click="prevPage">
                        Previous
                    </button>
                    <button 
                        :disabled="postId >= 99" 
                        @click="nextPage">
                        Next
                    </button>
                </div>
                    <div v-if = "comment[postId]">
                        <h3>Комментарии</h3>
                        <div class = "comment">
                            <p><span>Name:</span> {{comment[postId].name}}</p> 
                            <p><span>Email:</span> {{comment[postId].email}}</p>
                            <p class= "message"><span>Message:</span> {{comment[postId].body}}</p>
                        </div>
                    </div>
                </div>
  `
});
Vue.component('favorites', {
    data: function () {
        return {
            pageNumber: 0,
            favorites: [],
        }
    },
    props: {
        size: {
            type: Number,
            required: false,
            default: 10
        }
    },
    methods: {
        nextPage: function () {
            this.pageNumber++;
        },
        prevPage: function () {
            this.pageNumber--;
        },
        clear: function () {
            var favorite = JSON.parse(localStorage.getItem('favorites'));
            var buff = [];
            for (var i = 0; i < 100; i++) {
                if (favorite[i] != null) {
                    buff.push(favorite[i]);
                }
            }
            this.favorites = buff;
        }
    },
    created: function () {
        if (localStorage.favorites) {
            this.clear()
        } else {
            const parsed = JSON.stringify(this.favorites);
            localStorage.setItem('favorites', parsed);
        }
    },
    computed: {
        pageCount: function () {
            var l = this.favorites.length,
                s = this.size;
            if (l % s == 0) {
                return l / s
            } else {
                return Math.floor(l / s + 1);
            }
        },
        paginatedData: function () {
            var start = this.pageNumber * this.size,
                end = start + this.size;
            return this.favorites.slice(start, end);
        }
    },
    template: `<div>
                <h2>Избранное</h2>
                    <ul class="beads">
                        <li  v-for="favorite in paginatedData">
                        <router-link :to="{name:'post',params:{id:favorite.data['id']-1}}">{{favorite.data['title']}}</router-link> 
                        </li> 
                        <h2 v-if="paginatedData==0">Вы еще ничего не добавили в избранное</h2>
                    </ul>
                <div class="flex-container">
                    <button v-if="paginatedData!=0"
                        :disabled="pageNumber === 0" 
                        @click="prevPage">
                        Previous
                    </button>
                    <button v-if="paginatedData!=0"
                        :disabled="pageNumber >= pageCount -1" 
                        @click="nextPage">
                        Next
                    </button>
                </div>
                </div>
  `
});
const article = {
    template: '<list></list>'
}
const favorites = {
    template: '<favorites></favorites>'
}
const post = {
    template: '<post></post>'
}

const router = new VueRouter({
    routes: [
        {
            path: '/article',
            component: article
        },
        {
            path: '/post/:id',
            name: 'post',
            component: post
        },
        {
            path: '/favorites',
            component: favorites
        }
]
})

function request() {
    var data = [];
    fetch('https://jsonplaceholder.typicode.com/posts')
        .then(response => response.json())
        .then(json => {
            for (var i = 0; i < 100; i++) {
                data.push({
                    title: json[i].title,
                    body: json[i].body,
                    id: json[i].id,
                });
            }
        });
    return data;
}

function comment() {
    var comments = [];
    fetch('https://jsonplaceholder.typicode.com/comments')
        .then(response => response.json())
        .then(json => {
            for (var i = 0; i < 100; i++) {
                comments.push({
                    name: json[i].name,
                    email: json[i].email,
                    body: json[i].body,
                    id: json[i].id,
                    post: json[i].postId,
                });
            }
        });
    return comments;
}

function image() {
    var imgUrl = [];
    fetch('https://picsum.photos/list')
        .then(response => response.json())
        .then(json => {
            for (var i = 0; i < 100; i++) {
                imgUrl.push({
                    filename: json[i].filename,
                    id: json[i].id,
                    url: "https://picsum.photos/400/600?image=" + i,
                });
            }
        });
    return imgUrl;
}
const app = new Vue({
    el: '#app',
    router,
    data: {

    }
}).$mount('#app')
