import copy
import json

from django.contrib.gis.gdal import CoordTransform, SpatialReference
from django.contrib.gis.geos import GEOSGeometry, Point
from django.core.files import File
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.generic.base import TemplateView

from models import Geom, Pkk, Usage
from prj.settings import MEDIA_ROOT
from rosreestr2coord.parser import Area

import os

from rosreestr2coord.export import coords2geojson


class GetAreaView (TemplateView):
    template_name = 'pkk/index.html'

    def get_context_data(self, **kwargs):
        context = super(GetAreaView, self).get_context_data(**kwargs)
        code = kwargs.get('code')
        area_type = kwargs.get('area_type', 1)
        if code:
            area = _get_area(self.request, code, area_type)
            context["AREA"] = json.dumps(area)
        return context


def _transform_xy_array(array, from_crs=3857, to_crs=4326):
    coordinates = []
    from_coord = SpatialReference(from_crs)
    to_coord = SpatialReference(to_crs)
    trans = CoordTransform(from_coord, to_coord)
    for x, y in array:
        pnt = Point(x, y, srid=3857)
        pnt.transform(trans)
        coordinates.append(map(lambda i: "%f" % i, [pnt.x, pnt.y]))
    return coordinates


def _get_area(request, code, area_type):
    split = code.split('e')
    code = split[0]
    code = code.replace('-', ':')
    epsilon = float(split[1] if len(split) > 1 else 5)
    area_type = int(area_type if area_type else 1)
    data = {"code": code, "area_type": area_type}
    media_path = MEDIA_ROOT
    exist = False

    if code:
        pkk = (Pkk.objects.filter(code=code, area_type=area_type) or [None])[0]
        if pkk:
            exist = True
            area = Area(media_path=media_path, area_type=area_type, epsilon=epsilon)
            area.attrs = pkk.attrs
            area.image_path = pkk.image.path
            area.image_extent = pkk.image_extent
            area.center = pkk.center
            area.width = pkk.width
            area.height = pkk.height
            area.get_geometry()
        else:
            pkk = Pkk(code=code, area_type=area_type)
            area = Area(code, area_type, epsilon, media_path)

        xy = area.get_coord()
        if len(xy) and len(xy[0]):
            data["coordinates"] = copy.deepcopy(xy)
            for geom in data["coordinates"]:
                for p in range(len(geom)):
                    geom[p] = _transform_xy_array(geom[p])
            if area.center:
                data["center_pkk"] = area.center
            attrs = area.get_attrs()
            if attrs:
                pkk.attrs = attrs
                data["attrs"] = attrs

            if not exist:
                pkk.image = File(open(area.image_path))
                pkk.center = area.center
                pkk.extent = area.extent
                pkk.image_extent = area.image_extent
                pkk.width = area.width
                pkk.height = area.height
                pkk.save()
                os.remove(area.image_path)

            # geojson_poly = area.to_geojson_poly()
            geojson_poly = coords2geojson(data["coordinates"], "polygon", area.coord_out)
            if geojson_poly:
                try:
                    geometry = coords2geojson(area.get_coord(), "polygon", area.coord_out)
                    poly = GEOSGeometry(json.dumps(geometry['features'][0]['geometry']), srid=3857)
                    poly.transform(4326)
                    data["kml"] = poly.kml

                    geom = (Geom.objects.filter(code=pkk, epsilon=epsilon) or [None])[0]
                    if not geom:
                        geom = Geom(code=pkk, geom=poly, epsilon=epsilon)
                        geom.save()
                    usage = Usage(geom=geom)
                    if request.user.is_authenticated():
                        usage.user = request.user
                    usage.save()

                except Exception as er:
                    print(er)
                data["geojson"] = json.dumps(geojson_poly)
    return data


@csrf_exempt
def get_area(req, code, area_type):
    return JsonResponse(_get_area(req, code, area_type))
